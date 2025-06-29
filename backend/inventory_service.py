from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timedelta
import random

from models import InventoryItem, StockMovement, Warehouse, PurchaseOrder, PurchaseOrderItem
from schemas import InventoryItemCreateSchema, InventoryItemUpdateSchema

class InventoryService:
    def __init__(self):
        self.simulation_enabled = True
        
    def get_all_inventory(self, db: Session) -> List[InventoryItem]:
        """Get all inventory items with their current stock levels."""
        return db.query(InventoryItem).all()
    
    def get_inventory_item(self, db: Session, item_id: int) -> Optional[InventoryItem]:
        """Get a specific inventory item by ID."""
        return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    
    def get_inventory_by_sku(self, db: Session, sku: str) -> Optional[InventoryItem]:
        """Get inventory item by SKU."""
        return db.query(InventoryItem).filter(InventoryItem.sku == sku).first()
    
    def create_inventory_item(self, db: Session, item: InventoryItemCreateSchema) -> InventoryItem:
        """Create a new inventory item."""
        db_item = InventoryItem(**item.dict())
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Log initial stock movement
        self.log_stock_movement(
            db, db_item.id, "IN", db_item.current_stock, 
            "INITIAL_STOCK", None, "Initial inventory setup"
        )
        
        return db_item
    
    def update_inventory_item(self, db: Session, item_id: int, item: InventoryItemUpdateSchema) -> Optional[InventoryItem]:
        """Update an existing inventory item."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item:
            return None
            
        # Track stock changes
        old_stock = db_item.current_stock
        
        # Update fields
        for field, value in item.dict(exclude_unset=True).items():
            setattr(db_item, field, value)
        
        # Recalculate available stock
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        db_item.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_item)
        
        # Log stock movement if stock changed
        if old_stock != db_item.current_stock:
            quantity_change = db_item.current_stock - old_stock
            movement_type = "IN" if quantity_change > 0 else "OUT"
            self.log_stock_movement(
                db, db_item.id, movement_type, abs(quantity_change),
                "ADJUSTMENT", None, "Manual inventory adjustment"
            )
        
        return db_item
    
    def update_stock_level(self, db: Session, item_id: int, quantity: int, 
                          movement_type: str, reference_type: str = "MANUAL", 
                          reference_id: int = None, reason: str = None) -> Optional[InventoryItem]:
        """Update stock level and log the movement."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item:
            return None
        
        if movement_type == "IN":
            db_item.current_stock += quantity
        elif movement_type == "OUT":
            db_item.current_stock = max(0, db_item.current_stock - quantity)
        
        # Update available stock
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        db_item.updated_at = datetime.utcnow()
        
        # Update last restocked if it's an inbound movement
        if movement_type == "IN":
            db_item.last_restocked = datetime.utcnow()
        
        db.commit()
        db.refresh(db_item)
        
        # Log the movement
        self.log_stock_movement(
            db, item_id, movement_type, quantity, reference_type, reference_id, reason
        )
        
        return db_item
    
    def reserve_stock(self, db: Session, item_id: int, quantity: int) -> bool:
        """Reserve stock for an order."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item or db_item.available_stock < quantity:
            return False
        
        db_item.reserved_stock += quantity
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        db_item.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log the reservation
        self.log_stock_movement(
            db, item_id, "RESERVED", quantity, "ORDER", None, "Stock reserved for order"
        )
        
        return True
    
    def release_stock(self, db: Session, item_id: int, quantity: int) -> bool:
        """Release reserved stock."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item or db_item.reserved_stock < quantity:
            return False
        
        db_item.reserved_stock -= quantity
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        db_item.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log the release
        self.log_stock_movement(
            db, item_id, "RELEASED", quantity, "ORDER", None, "Stock released from reservation"
        )
        
        return True
    
    def fulfill_stock(self, db: Session, item_id: int, quantity: int, reference_id: int = None) -> bool:
        """Fulfill stock for an order (remove from both reserved and current stock)."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item or db_item.reserved_stock < quantity:
            return False
        
        db_item.current_stock -= quantity
        db_item.reserved_stock -= quantity
        db_item.available_stock = db_item.current_stock - db_item.reserved_stock
        db_item.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log the fulfillment
        self.log_stock_movement(
            db, item_id, "OUT", quantity, "ORDER", reference_id, "Stock fulfilled for order"
        )
        
        return True
    
    def log_stock_movement(self, db: Session, item_id: int, movement_type: str, 
                          quantity: int, reference_type: str, reference_id: int = None, 
                          reason: str = None, created_by: str = "SYSTEM"):
        """Log a stock movement."""
        movement = StockMovement(
            inventory_item_id=item_id,
            movement_type=movement_type,
            quantity=quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            created_by=created_by
        )
        
        db.add(movement)
        db.commit()
    
    def get_low_stock_items(self, db: Session, threshold_multiplier: float = 1.0) -> List[InventoryItem]:
        """Get items that are below their reorder point."""
        return db.query(InventoryItem).filter(
            InventoryItem.current_stock <= InventoryItem.reorder_point * threshold_multiplier
        ).all()
    
    def get_out_of_stock_items(self, db: Session) -> List[InventoryItem]:
        """Get items that are completely out of stock."""
        return db.query(InventoryItem).filter(InventoryItem.current_stock <= 0).all()
    
    def get_overstocked_items(self, db: Session) -> List[InventoryItem]:
        """Get items that exceed their maximum stock level."""
        return db.query(InventoryItem).filter(
            InventoryItem.current_stock > InventoryItem.max_stock_level
        ).all()
    
    def get_recent_stock_movements(self, db: Session, limit: int = 50) -> List[StockMovement]:
        """Get recent stock movements."""
        return db.query(StockMovement).order_by(
            StockMovement.created_at.desc()
        ).limit(limit).all()
    
    def get_inventory_metrics(self, db: Session) -> Dict[str, Any]:
        """Calculate inventory metrics."""
        total_items = db.query(InventoryItem).count()
        low_stock_items = len(self.get_low_stock_items(db))
        out_of_stock_items = len(self.get_out_of_stock_items(db))
        
        # Calculate total inventory value
        total_value = db.query(
            func.sum(InventoryItem.current_stock * InventoryItem.unit_cost)
        ).scalar() or 0
        
        # Calculate average stock levels
        avg_stock = db.query(func.avg(InventoryItem.current_stock)).scalar() or 0
        
        # Calculate stock turnover (simplified)
        recent_movements = db.query(StockMovement).filter(
            StockMovement.created_at >= datetime.utcnow() - timedelta(days=30),
            StockMovement.movement_type == "OUT"
        ).all()
        
        monthly_sales = sum(movement.quantity for movement in recent_movements)
        turnover_rate = (monthly_sales / max(avg_stock, 1)) * 12  # Annualized
        
        return {
            "total_items": total_items,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "total_inventory_value": round(total_value, 2),
            "average_stock_level": round(avg_stock, 2),
            "inventory_turnover_rate": round(turnover_rate, 2),
            "stock_availability_rate": round((total_items - out_of_stock_items) / max(total_items, 1) * 100, 2)
        }
    
    async def trigger_automatic_reorder(self, db: Session, item_id: int) -> Dict[str, Any]:
        """Trigger automatic reorder for an item."""
        db_item = self.get_inventory_item(db, item_id)
        if not db_item:
            return {"success": False, "message": "Item not found"}
        
        if db_item.current_stock > db_item.reorder_point:
            return {"success": False, "message": "Item stock is above reorder point"}
        
        # For demo purposes, simulate placing a purchase order
        # In a real system, this would integrate with supplier APIs
        
        # Create a purchase order (simplified)
        reorder_quantity = db_item.reorder_quantity
        estimated_cost = reorder_quantity * db_item.unit_cost
        
        # Simulate processing delay
        await asyncio.sleep(0.1)
        
        return {
            "success": True,
            "message": f"Reorder triggered for {db_item.name}",
            "details": {
                "item_name": db_item.name,
                "sku": db_item.sku,
                "current_stock": db_item.current_stock,
                "reorder_point": db_item.reorder_point,
                "reorder_quantity": reorder_quantity,
                "estimated_cost": estimated_cost,
                "expected_delivery": (datetime.utcnow() + timedelta(days=7)).isoformat()
            }
        }
    
    async def update_real_time_inventory(self, db: Session):
        """Simulate real-time inventory updates (for demo purposes)."""
        if not self.simulation_enabled:
            return
        
        try:
            # Get a few random items to simulate stock changes
            items = db.query(InventoryItem).limit(5).all()
            
            for item in items:
                # Randomly simulate stock movements
                if random.random() < 0.3:  # 30% chance of stock change
                    change = random.randint(-5, 10)
                    if change > 0:
                        # Simulate restocking
                        self.update_stock_level(
                            db, item.id, change, "IN", "RESTOCK", 
                            reason="Automated restock simulation"
                        )
                    elif change < 0 and item.current_stock > abs(change):
                        # Simulate sales
                        self.update_stock_level(
                            db, item.id, abs(change), "OUT", "SALE", 
                            reason="Automated sale simulation"
                        )
                        
        except Exception as e:
            print(f"Error in real-time inventory update: {e}")
    
    def get_inventory_analytics(self, db: Session) -> Dict[str, Any]:
        """Get detailed inventory analytics."""
        # Stock level distribution
        stock_ranges = {
            "critical": 0,  # 0-10
            "low": 0,       # 11-50
            "medium": 0,    # 51-200
            "high": 0       # 200+
        }
        
        items = self.get_all_inventory(db)
        for item in items:
            if item.current_stock <= 10:
                stock_ranges["critical"] += 1
            elif item.current_stock <= 50:
                stock_ranges["low"] += 1
            elif item.current_stock <= 200:
                stock_ranges["medium"] += 1
            else:
                stock_ranges["high"] += 1
        
        # Category analysis
        category_analysis = db.query(
            InventoryItem.category,
            func.count(InventoryItem.id).label('item_count'),
            func.sum(InventoryItem.current_stock).label('total_stock'),
            func.sum(InventoryItem.current_stock * InventoryItem.unit_cost).label('total_value')
        ).group_by(InventoryItem.category).all()
        
        return {
            "stock_distribution": stock_ranges,
            "category_analysis": [
                {
                    "category": cat[0],
                    "item_count": cat[1],
                    "total_stock": cat[2],
                    "total_value": round(cat[3], 2)
                } for cat in category_analysis
            ],
            "metrics": self.get_inventory_metrics(db)
        } 