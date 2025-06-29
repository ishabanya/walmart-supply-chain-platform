from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_types: Dict[str, str] = {}  # Track client types (admin, customer, driver)
        
    async def connect(self, websocket: WebSocket, client_id: str, client_type: str = "admin"):
        """Accept a WebSocket connection and store it."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_types[client_id] = client_type
        
        # Send initial connection confirmation
        await self.send_personal_message({
            "type": "connection_confirmed",
            "message": f"Connected as {client_type}",
            "client_id": client_id,
            "timestamp": datetime.now().isoformat()
        }, client_id)
        
        print(f"🔗 Client {client_id} ({client_type}) connected")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            if client_id in self.client_types:
                del self.client_types[client_id]
            print(f"🔌 Client {client_id} disconnected")
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"❌ Error sending message to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: dict, client_types: List[str] = None):
        """Broadcast a message to all connected clients or specific client types."""
        if not self.active_connections:
            return
            
        # Filter clients by type if specified
        target_clients = self.active_connections.keys()
        if client_types:
            target_clients = [
                client_id for client_id, client_type in self.client_types.items()
                if client_type in client_types
            ]
        
        # Send to all target clients
        disconnected_clients = []
        for client_id in target_clients:
            if client_id in self.active_connections:
                try:
                    websocket = self.active_connections[client_id]
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    print(f"❌ Error broadcasting to {client_id}: {e}")
                    disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def broadcast_inventory_updates(self, db: Session):
        """Broadcast inventory updates to relevant clients."""
        try:
            from inventory_service import InventoryService
            inventory_service = InventoryService()
            
            # Get low stock items
            low_stock_items = inventory_service.get_low_stock_items(db)
            
            # Get recent stock movements
            recent_movements = inventory_service.get_recent_stock_movements(db, limit=10)
            
            message = {
                "type": "inventory_update",
                "data": {
                    "low_stock_items": [
                        {
                            "id": item.id,
                            "name": item.name,
                            "sku": item.sku,
                            "current_stock": item.current_stock,
                            "reorder_point": item.reorder_point
                        } for item in low_stock_items
                    ],
                    "recent_movements": [
                        {
                            "id": movement.id,
                            "item_name": movement.inventory_item.name,
                            "movement_type": movement.movement_type,
                            "quantity": movement.quantity,
                            "created_at": movement.created_at.isoformat()
                        } for movement in recent_movements
                    ]
                },
                "timestamp": datetime.now().isoformat()
            }
            
            await self.broadcast(message, ["admin", "manager"])
            
        except Exception as e:
            print(f"❌ Error broadcasting inventory updates: {e}")
    
    async def broadcast_delivery_updates(self, db: Session):
        """Broadcast delivery updates to relevant clients."""
        try:
            from delivery_service import DeliveryService
            delivery_service = DeliveryService()
            
            # Get active deliveries
            active_deliveries = delivery_service.get_active_deliveries(db)
            
            message = {
                "type": "delivery_update",
                "data": {
                    "active_deliveries": [
                        {
                            "id": delivery.id,
                            "delivery_number": delivery.delivery_number,
                            "status": delivery.status,
                            "driver_name": f"{delivery.driver.first_name} {delivery.driver.last_name}" if delivery.driver else None,
                            "current_location": {
                                "latitude": delivery.current_latitude,
                                "longitude": delivery.current_longitude
                            } if delivery.current_latitude and delivery.current_longitude else None,
                            "estimated_arrival": delivery.estimated_arrival.isoformat() if delivery.estimated_arrival else None
                        } for delivery in active_deliveries
                    ]
                },
                "timestamp": datetime.now().isoformat()
            }
            
            await self.broadcast(message, ["admin", "manager", "driver"])
            
        except Exception as e:
            print(f"❌ Error broadcasting delivery updates: {e}")
    
    async def broadcast_order_updates(self, db: Session):
        """Broadcast order updates to relevant clients."""
        try:
            from supply_chain_service import SupplyChainService
            supply_chain_service = SupplyChainService()
            
            # Get pending orders
            pending_orders = supply_chain_service.get_orders(db, status="PENDING")
            
            message = {
                "type": "order_update",
                "data": {
                    "pending_orders_count": len(pending_orders),
                    "recent_orders": [
                        {
                            "id": order.id,
                            "order_number": order.order_number,
                            "status": order.status,
                            "total_amount": order.total_amount,
                            "order_date": order.order_date.isoformat()
                        } for order in pending_orders[:5]  # Show only first 5
                    ]
                },
                "timestamp": datetime.now().isoformat()
            }
            
            await self.broadcast(message, ["admin", "manager"])
            
        except Exception as e:
            print(f"❌ Error broadcasting order updates: {e}")
    
    async def send_alert(self, alert_type: str, message: str, severity: str = "medium", client_types: List[str] = None):
        """Send an alert to specified client types."""
        alert_message = {
            "type": "alert",
            "data": {
                "alert_type": alert_type,
                "message": message,
                "severity": severity,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await self.broadcast(alert_message, client_types or ["admin", "manager"])
    
    async def send_delivery_notification(self, delivery_id: int, status: str, customer_id: str = None):
        """Send delivery notification to customer."""
        message = {
            "type": "delivery_notification",
            "data": {
                "delivery_id": delivery_id,
                "status": status,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        if customer_id:
            await self.send_personal_message(message, customer_id)
        else:
            await self.broadcast(message, ["customer"])
    
    def get_connected_clients(self) -> Dict[str, str]:
        """Get list of connected clients and their types."""
        return {
            client_id: client_type 
            for client_id, client_type in self.client_types.items()
            if client_id in self.active_connections
        }
    
    def get_stats(self) -> dict:
        """Get connection statistics."""
        client_counts = {}
        for client_type in self.client_types.values():
            client_counts[client_type] = client_counts.get(client_type, 0) + 1
        
        return {
            "total_connections": len(self.active_connections),
            "client_types": client_counts,
            "connected_clients": list(self.active_connections.keys())
        } 