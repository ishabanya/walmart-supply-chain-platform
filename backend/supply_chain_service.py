from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timedelta
import random
import uuid

from models import (
    Order, OrderItem, Customer, Supplier, Warehouse, InventoryItem,
    PurchaseOrder, PurchaseOrderItem, PerformanceMetric
)
from schemas import OrderCreateSchema, SupplierCreateSchema

class SupplyChainService:
    def __init__(self):
        self.simulation_enabled = True
        
    # Order Management
    def get_orders(self, db: Session, status: Optional[str] = None) -> List[Order]:
        """Get orders with optional status filter."""
        query = db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        return query.order_by(Order.created_at.desc()).limit(100).all()
    
    def get_order(self, db: Session, order_id: int) -> Optional[Order]:
        """Get a specific order by ID."""
        return db.query(Order).filter(Order.id == order_id).first()
    
    def create_order(self, db: Session, order: OrderCreateSchema) -> Order:
        """Create a new order."""
        # Generate order number
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate totals
        total_amount = sum(item.quantity * item.unit_price for item in order.items)
        tax_amount = total_amount * 0.08  # 8% tax
        shipping_cost = 15.99 if total_amount < 100 else 0  # Free shipping over $100
        
        # Create order
        db_order = Order(
            order_number=order_number,
            customer_id=order.customer_id,
            warehouse_id=order.warehouse_id,
            total_amount=total_amount,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            shipping_address=order.shipping_address,
            shipping_city=order.shipping_city,
            shipping_state=order.shipping_state,
            shipping_zip=order.shipping_zip,
            shipping_method=order.shipping_method,
            notes=order.notes,
            expected_delivery_date=datetime.utcnow() + timedelta(days=3)
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Create order items
        for item_data in order.items:
            order_item = OrderItem(
                order_id=db_order.id,
                inventory_item_id=item_data.inventory_item_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.quantity * item_data.unit_price
            )
            db.add(order_item)
        
        db.commit()
        return db_order
    
    def update_order_status(self, db: Session, order_id: int, status: str) -> Optional[Order]:
        """Update order status."""
        db_order = self.get_order(db, order_id)
        if not db_order:
            return None
        
        db_order.status = status
        db_order.updated_at = datetime.utcnow()
        
        # Update timestamps based on status
        if status == "SHIPPED":
            db_order.shipped_date = datetime.utcnow()
        elif status == "DELIVERED":
            db_order.delivered_date = datetime.utcnow()
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    def process_order_fulfillment(self, db: Session, order_id: int) -> bool:
        """Process order fulfillment by removing inventory from stock."""
        from inventory_service import InventoryService
        inventory_service = InventoryService()
        
        order = self.get_order(db, order_id)
        if not order:
            return False
        
        # Fulfill each order item
        for order_item in order.order_items:
            success = inventory_service.fulfill_stock(
                db, order_item.inventory_item_id, order_item.quantity, order_id
            )
            if success:
                order_item.quantity_fulfilled = order_item.quantity
            else:
                # Partial fulfillment or failure
                available = inventory_service.get_inventory_item(
                    db, order_item.inventory_item_id
                ).available_stock
                order_item.quantity_fulfilled = min(order_item.quantity, available)
                order_item.quantity_cancelled = order_item.quantity - order_item.quantity_fulfilled
        
        db.commit()
        return True
    
    def create_delivery_for_order(self, db: Session, order_id: int) -> bool:
        """Create a delivery record when order is shipped."""
        from delivery_service import DeliveryService
        delivery_service = DeliveryService()
        
        order = self.get_order(db, order_id)
        if not order:
            return False
        
        # Generate tracking number
        tracking_number = f"TRK{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
        order.tracking_number = tracking_number
        
        # Create delivery record
        delivery_data = {
            "order_id": order_id,
            "delivery_address": order.shipping_address,
            "delivery_city": order.shipping_city,
            "delivery_state": order.shipping_state,
            "delivery_zip": order.shipping_zip,
            "recipient_name": f"{order.customer.first_name} {order.customer.last_name}",
            "recipient_phone": order.customer.phone or "N/A",
            "scheduled_date": datetime.utcnow() + timedelta(hours=24)
        }
        
        delivery_service.create_delivery_from_order(db, delivery_data)
        
        db.commit()
        return True
    
    def update_customer_metrics(self, db: Session, customer_id: int, order_amount: float):
        """Update customer metrics after order."""
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer:
            customer.total_orders += 1
            customer.total_spent += order_amount
            customer.loyalty_points += int(order_amount * 0.1)  # 10% of order value as points
            customer.updated_at = datetime.utcnow()
            db.commit()
    
    # Supplier Management
    def get_all_suppliers(self, db: Session) -> List[Supplier]:
        """Get all suppliers."""
        return db.query(Supplier).filter(Supplier.is_active == True).all()
    
    def get_supplier(self, db: Session, supplier_id: int) -> Optional[Supplier]:
        """Get a specific supplier by ID."""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    def create_supplier(self, db: Session, supplier: SupplierCreateSchema) -> Supplier:
        """Create a new supplier."""
        db_supplier = Supplier(**supplier.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    
    def update_supplier_performance(self, db: Session, supplier_id: int, 
                                  delivery_time: int, quality_rating: float):
        """Update supplier performance metrics."""
        supplier = self.get_supplier(db, supplier_id)
        if not supplier:
            return False
        
        # Update average delivery time
        if supplier.average_delivery_time:
            supplier.average_delivery_time = (supplier.average_delivery_time + delivery_time) / 2
        else:
            supplier.average_delivery_time = delivery_time
        
        # Update quality rating
        if supplier.quality_rating:
            supplier.quality_rating = (supplier.quality_rating + quality_rating) / 2
        else:
            supplier.quality_rating = quality_rating
        
        # Update reliability score based on performance
        supplier.reliability_score = (supplier.quality_rating + 
                                    (10 - min(supplier.average_delivery_time / 7, 10))) / 2
        
        supplier.updated_at = datetime.utcnow()
        db.commit()
        return True
    
    # Warehouse Management
    def get_all_warehouses(self, db: Session) -> List[Warehouse]:
        """Get all warehouses."""
        return db.query(Warehouse).filter(Warehouse.is_active == True).all()
    
    def get_optimal_warehouse(self, db: Session, customer_location: tuple) -> Optional[Warehouse]:
        """Find the optimal warehouse for a customer (simplified)."""
        warehouses = self.get_all_warehouses(db)
        if not warehouses:
            return None
        
        # For demo, return warehouse with lowest utilization
        return min(warehouses, key=lambda w: w.current_utilization or 0)
    
    def update_warehouse_utilization(self, db: Session):
        """Update warehouse utilization metrics."""
        warehouses = self.get_all_warehouses(db)
        
        for warehouse in warehouses:
            # Calculate utilization based on inventory
            total_items = db.query(func.count(InventoryItem.id)).filter(
                InventoryItem.warehouse_id == warehouse.id
            ).scalar() or 0
            
            total_stock = db.query(func.sum(InventoryItem.current_stock)).filter(
                InventoryItem.warehouse_id == warehouse.id
            ).scalar() or 0
            
            # Simple utilization calculation (in real system, would use volume/space)
            if warehouse.total_capacity:
                warehouse.current_utilization = min(
                    (total_stock / warehouse.total_capacity) * 100, 100
                )
            else:
                warehouse.current_utilization = min((total_items / 1000) * 100, 100)
            
            warehouse.updated_at = datetime.utcnow()
        
        db.commit()
    
    # Route Optimization
    async def optimize_delivery_routes(self, db: Session) -> Dict[str, Any]:
        """Optimize delivery routes."""
        # Mock optimization for demo
        return {
            "message": "Routes optimized successfully",
            "total_savings": 125.50,
            "routes_optimized": 5
        }
    
    # Metrics and Analytics
    def get_key_metrics(self, db: Session) -> Dict[str, Any]:
        """Get key supply chain metrics."""
        total_orders = db.query(Order).count()
        pending_orders = db.query(Order).filter(Order.status == "PENDING").count()
        shipped_orders = db.query(Order).filter(Order.status == "SHIPPED").count()
        delivered_orders = db.query(Order).filter(Order.status == "DELIVERED").count()
        
        # Calculate fulfillment rate
        fulfillment_rate = (delivered_orders / max(total_orders, 1)) * 100
        
        # Calculate average fulfillment time
        completed_orders = db.query(Order).filter(
            Order.status == "DELIVERED",
            Order.delivered_date.isnot(None)
        ).all()
        
        if completed_orders:
            avg_fulfillment_time = sum([
                (order.delivered_date - order.order_date).total_seconds() / 3600
                for order in completed_orders
            ]) / len(completed_orders)
        else:
            avg_fulfillment_time = 0
        
        # Revenue metrics
        total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
        monthly_revenue = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
        
        # Supplier performance
        avg_supplier_rating = db.query(func.avg(Supplier.quality_rating)).scalar() or 0
        
        return {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "shipped_orders": shipped_orders,
            "delivered_orders": delivered_orders,
            "fulfillment_rate": round(fulfillment_rate, 2),
            "average_fulfillment_time": round(avg_fulfillment_time, 2),
            "total_revenue": round(total_revenue, 2),
            "monthly_revenue": round(monthly_revenue, 2),
            "supplier_performance": round(avg_supplier_rating, 2)
        }
    
    def get_fulfillment_rate(self, db: Session) -> float:
        """Calculate order fulfillment rate."""
        total_orders = db.query(Order).count()
        delivered_orders = db.query(Order).filter(Order.status == "DELIVERED").count()
        
        if total_orders == 0:
            return 0.0
        
        return round((delivered_orders / total_orders) * 100, 2)
    
    def get_performance_trends(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Get performance trends over specified period."""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Daily order counts
        daily_orders = []
        current_date = start_date
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            day_orders = db.query(Order).filter(
                and_(Order.created_at >= current_date, Order.created_at < next_date)
            ).count()
            
            daily_orders.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "orders": day_orders
            })
            
            current_date = next_date
        
        # Revenue trends
        weekly_revenue = []
        for week in range(4):  # Last 4 weeks
            week_start = end_date - timedelta(weeks=week+1)
            week_end = end_date - timedelta(weeks=week)
            
            revenue = db.query(func.sum(Order.total_amount)).filter(
                and_(Order.created_at >= week_start, Order.created_at < week_end)
            ).scalar() or 0
            
            weekly_revenue.append({
                "week": f"Week {4-week}",
                "revenue": round(revenue, 2)
            })
        
        return {
            "daily_orders": daily_orders,
            "weekly_revenue": weekly_revenue
        }
    
    async def simulate_order_processing(self, db: Session):
        """Simulate automatic order processing for demo."""
        if not self.simulation_enabled:
            return
        
        try:
            # Get some pending orders and randomly advance their status
            pending_orders = db.query(Order).filter(Order.status == "PENDING").limit(3).all()
            
            for order in pending_orders:
                if random.random() < 0.4:  # 40% chance to process
                    self.update_order_status(db, order.id, "PROCESSING")
            
            # Advance some processing orders to shipped
            processing_orders = db.query(Order).filter(Order.status == "PROCESSING").limit(2).all()
            
            for order in processing_orders:
                if random.random() < 0.3:  # 30% chance to ship
                    self.update_order_status(db, order.id, "SHIPPED")
                    
        except Exception as e:
            print(f"Error in order processing simulation: {e}") 