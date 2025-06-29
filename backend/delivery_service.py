from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timedelta
import random
import uuid
import math

from models import (
    Delivery, DeliveryUpdate, Driver, Vehicle, Order, Customer,
    DeliveryRoute, PerformanceMetric
)
from schemas import LocationUpdateSchema

class DeliveryService:
    def __init__(self):
        self.simulation_enabled = True
        
    # Delivery Management
    def get_deliveries(self, db: Session, status: Optional[str] = None) -> List[Delivery]:
        """Get deliveries with optional status filter."""
        query = db.query(Delivery)
        if status:
            query = query.filter(Delivery.status == status)
        return query.order_by(Delivery.created_at.desc()).limit(100).all()
    
    def get_delivery(self, db: Session, delivery_id: int) -> Optional[Delivery]:
        """Get a specific delivery by ID."""
        return db.query(Delivery).filter(Delivery.id == delivery_id).first()
    
    def get_active_deliveries(self, db: Session) -> List[Delivery]:
        """Get all active deliveries."""
        return db.query(Delivery).filter(
            Delivery.status.in_(["ASSIGNED", "IN_TRANSIT"])
        ).all()
    
    def create_delivery_from_order(self, db: Session, delivery_data: Dict[str, Any]) -> Delivery:
        """Create a delivery record from order data."""
        # Generate delivery number
        delivery_number = f"DEL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create delivery record
        db_delivery = Delivery(
            delivery_number=delivery_number,
            order_id=delivery_data["order_id"],
            delivery_address=delivery_data["delivery_address"],
            delivery_city=delivery_data["delivery_city"],
            delivery_state=delivery_data["delivery_state"],
            delivery_zip=delivery_data["delivery_zip"],
            recipient_name=delivery_data["recipient_name"],
            recipient_phone=delivery_data["recipient_phone"],
            scheduled_date=delivery_data.get("scheduled_date"),
            delivery_instructions=delivery_data.get("delivery_instructions"),
            status="PENDING"
        )
        
        # Estimate delivery coordinates (in real system, use geocoding service)
        db_delivery.delivery_latitude = 40.7128 + random.uniform(-0.1, 0.1)  # NYC area
        db_delivery.delivery_longitude = -74.0060 + random.uniform(-0.1, 0.1)
        
        db.add(db_delivery)
        db.commit()
        db.refresh(db_delivery)
        
        # Create initial delivery update
        self.add_delivery_update(
            db, db_delivery.id, "PENDING", "Delivery created and awaiting assignment"
        )
        
        return db_delivery
    
    def assign_delivery(self, db: Session, delivery_id: int, driver_id: int, vehicle_id: int) -> bool:
        """Assign a driver and vehicle to a delivery."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery or delivery.status != "PENDING":
            return False
        
        # Check driver availability
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver or driver.current_status != "AVAILABLE":
            return False
        
        # Check vehicle availability
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle or vehicle.current_status != "AVAILABLE":
            return False
        
        # Assign delivery
        delivery.driver_id = driver_id
        delivery.vehicle_id = vehicle_id
        delivery.status = "ASSIGNED"
        delivery.estimated_arrival = datetime.utcnow() + timedelta(hours=2)
        
        # Update driver and vehicle status
        driver.current_status = "ON_DELIVERY"
        vehicle.current_status = "IN_USE"
        
        db.commit()
        
        # Add delivery update
        self.add_delivery_update(
            db, delivery_id, "ASSIGNED", 
            f"Assigned to {driver.first_name} {driver.last_name}"
        )
        
        return True
    
    def start_delivery(self, db: Session, delivery_id: int) -> bool:
        """Start a delivery (driver picks up package)."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery or delivery.status != "ASSIGNED":
            return False
        
        delivery.status = "IN_TRANSIT"
        delivery.pickup_time = datetime.utcnow()
        
        # Set initial location (warehouse location)
        delivery.current_latitude = 40.7589  # Example warehouse location
        delivery.current_longitude = -73.9851
        delivery.last_location_update = datetime.utcnow()
        
        db.commit()
        
        # Add delivery update
        self.add_delivery_update(
            db, delivery_id, "IN_TRANSIT", "Package picked up and in transit"
        )
        
        return True
    
    def complete_delivery(self, db: Session, delivery_id: int, 
                         customer_rating: Optional[int] = None,
                         customer_feedback: Optional[str] = None) -> bool:
        """Complete a delivery."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery or delivery.status != "IN_TRANSIT":
            return False
        
        delivery.status = "DELIVERED"
        delivery.delivery_time = datetime.utcnow()
        delivery.actual_arrival = datetime.utcnow()
        
        if customer_rating:
            delivery.customer_rating = customer_rating
        if customer_feedback:
            delivery.customer_feedback = customer_feedback
        
        # Update driver status and metrics
        if delivery.driver:
            delivery.driver.current_status = "AVAILABLE"
            delivery.driver.total_deliveries += 1
            delivery.driver.successful_deliveries += 1
            
            # Update average rating
            if customer_rating:
                current_rating = delivery.driver.average_rating or 5.0
                delivery.driver.average_rating = (current_rating + customer_rating) / 2
        
        # Update vehicle status
        if delivery.vehicle:
            delivery.vehicle.current_status = "AVAILABLE"
        
        # Update order status
        if delivery.order:
            delivery.order.status = "DELIVERED"
            delivery.order.delivered_date = datetime.utcnow()
        
        db.commit()
        
        # Add delivery update
        self.add_delivery_update(
            db, delivery_id, "DELIVERED", "Package delivered successfully"
        )
        
        return True
    
    def fail_delivery(self, db: Session, delivery_id: int, reason: str) -> bool:
        """Mark a delivery as failed."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery:
            return False
        
        delivery.status = "FAILED"
        delivery.delivery_notes = reason
        
        # Update driver status
        if delivery.driver:
            delivery.driver.current_status = "AVAILABLE"
        
        # Update vehicle status
        if delivery.vehicle:
            delivery.vehicle.current_status = "AVAILABLE"
        
        db.commit()
        
        # Add delivery update
        self.add_delivery_update(
            db, delivery_id, "FAILED", f"Delivery failed: {reason}"
        )
        
        return True
    
    async def update_delivery_location(self, db: Session, delivery_id: int, 
                                     location: LocationUpdateSchema) -> bool:
        """Update delivery location."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery:
            return False
        
        delivery.current_latitude = location.latitude
        delivery.current_longitude = location.longitude
        delivery.last_location_update = datetime.utcnow()
        
        db.commit()
        return True
    
    def add_delivery_update(self, db: Session, delivery_id: int, status: str, 
                           message: str, latitude: Optional[float] = None, 
                           longitude: Optional[float] = None):
        """Add a delivery status update."""
        update = DeliveryUpdate(
            delivery_id=delivery_id,
            status=status,
            message=message,
            latitude=latitude,
            longitude=longitude,
            created_by="SYSTEM"
        )
        
        db.add(update)
        db.commit()
    
    def get_delivery_tracking(self, db: Session, delivery_id: int) -> Optional[Dict[str, Any]]:
        """Get delivery tracking information."""
        delivery = self.get_delivery(db, delivery_id)
        if not delivery:
            return None
        
        return {
            "delivery": {
                "id": delivery.id,
                "delivery_number": delivery.delivery_number,
                "status": delivery.status,
                "current_location": {
                    "latitude": delivery.current_latitude,
                    "longitude": delivery.current_longitude
                } if delivery.current_latitude else None
            }
        }
    
    # Driver and Vehicle Management
    def get_available_drivers(self, db: Session) -> List[Driver]:
        """Get available drivers."""
        return db.query(Driver).filter(
            Driver.is_active == True,
            Driver.current_status == "AVAILABLE"
        ).all()
    
    def get_available_vehicles(self, db: Session) -> List[Vehicle]:
        """Get available vehicles."""
        return db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.current_status == "AVAILABLE"
        ).all()
    
    def auto_assign_deliveries(self, db: Session) -> int:
        """Automatically assign pending deliveries to available drivers/vehicles."""
        pending_deliveries = self.get_deliveries(db, status="PENDING")
        available_drivers = self.get_available_drivers(db)
        available_vehicles = self.get_available_vehicles(db)
        
        if not available_drivers or not available_vehicles:
            return 0
        
        assigned_count = 0
        for delivery in pending_deliveries:
            if assigned_count >= len(available_drivers) or assigned_count >= len(available_vehicles):
                break
            
            driver = available_drivers[assigned_count]
            vehicle = available_vehicles[assigned_count]
            
            if self.assign_delivery(db, delivery.id, driver.id, vehicle.id):
                assigned_count += 1
        
        return assigned_count
    
    # Analytics and Metrics
    def get_delivery_metrics(self, db: Session) -> Dict[str, Any]:
        """Get delivery performance metrics."""
        total_deliveries = db.query(Delivery).count()
        successful_deliveries = db.query(Delivery).filter(Delivery.status == "DELIVERED").count()
        
        success_rate = (successful_deliveries / max(total_deliveries, 1)) * 100
        
        return {
            "total_deliveries": total_deliveries,
            "successful_deliveries": successful_deliveries,
            "success_rate": round(success_rate, 2),
            "customer_satisfaction": 4.5
        }
    
    def get_delivery_success_rate(self, db: Session) -> float:
        """Calculate delivery success rate."""
        total_deliveries = db.query(Delivery).count()
        successful_deliveries = db.query(Delivery).filter(Delivery.status == "DELIVERED").count()
        
        if total_deliveries == 0:
            return 0.0
        
        return round((successful_deliveries / total_deliveries) * 100, 2)
    
    def get_customer_satisfaction_score(self, db: Session) -> float:
        """Calculate average customer satisfaction score."""
        return 4.5  # Mock score
    
    # Utility Functions
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in miles."""
        R = 3959  # Earth's radius in miles
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def is_significant_movement(self, db: Session, delivery_id: int, 
                              new_lat: float, new_lon: float) -> bool:
        """Check if location update represents significant movement."""
        last_update = db.query(DeliveryUpdate).filter(
            DeliveryUpdate.delivery_id == delivery_id,
            DeliveryUpdate.latitude.isnot(None),
            DeliveryUpdate.longitude.isnot(None)
        ).order_by(DeliveryUpdate.created_at.desc()).first()
        
        if not last_update:
            return True
        
        distance = self.calculate_distance(
            last_update.latitude, last_update.longitude, new_lat, new_lon
        )
        
        return distance > 0.5  # Significant if moved more than 0.5 miles
    
    async def update_delivery_statuses(self, db: Session):
        """Simulate delivery status updates."""
        if not self.simulation_enabled:
            return
        
        try:
            deliveries = db.query(Delivery).filter(
                Delivery.status.in_(["PENDING", "ASSIGNED"])
            ).limit(2).all()
            
            for delivery in deliveries:
                if random.random() < 0.2:  # 20% chance to update
                    if delivery.status == "PENDING":
                        delivery.status = "ASSIGNED"
                    elif delivery.status == "ASSIGNED":
                        delivery.status = "IN_TRANSIT"
            
            db.commit()
        except Exception as e:
            print(f"Error in delivery updates: {e}") 