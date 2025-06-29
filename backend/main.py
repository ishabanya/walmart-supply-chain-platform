from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
from typing import List, Optional
import json
import asyncio
from datetime import datetime, timedelta
import os
from contextlib import asynccontextmanager
from config import settings

# Import all modules
from database import SessionLocal, engine, Base
from models import *
from schemas import *
from auth import get_current_user, create_access_token
from inventory_service import InventoryService
from supply_chain_service import SupplyChainService
from delivery_service import DeliveryService
from ml_service import MLService
from websocket_manager import ConnectionManager

# Create database tables
Base.metadata.create_all(bind=engine)

# WebSocket manager
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize services and sample data
    print("🚀 Initializing Walmart Supply Chain Platform...")
    
    # Initialize sample data
    from sample_data import initialize_sample_data
    db = SessionLocal()
    try:
        initialize_sample_data(db)
        print("✅ Sample data initialized successfully")
    finally:
        db.close()
    
    # Start background tasks
    asyncio.create_task(periodic_updates())
    
    yield
    
    # Shutdown
    print("🛑 Shutting down platform...")

app = FastAPI(
    title="Walmart Supply Chain Transformation Platform",
    description="Comprehensive supply chain management from inventory to last-mile delivery",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Services
inventory_service = InventoryService()
supply_chain_service = SupplyChainService()
delivery_service = DeliveryService()
ml_service = MLService()

# Background task for real-time updates
async def periodic_updates():
    while True:
        try:
            db = SessionLocal()
            
            # Update inventory levels
            await inventory_service.update_real_time_inventory(db)
            
            # Update delivery statuses
            await delivery_service.update_delivery_statuses(db)
            
            # Broadcast updates to connected clients
            await manager.broadcast_inventory_updates(db)
            await manager.broadcast_delivery_updates(db)
            
            db.close()
            
        except Exception as e:
            print(f"Error in periodic updates: {e}")
            
        await asyncio.sleep(30)  # Update every 30 seconds

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await manager.send_personal_message(f"Message received: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# Authentication Routes
@app.post("/auth/login", response_model=TokenSchema)
async def login(credentials: LoginSchema, db: Session = Depends(get_db)):
    # Simple authentication for demo
    if credentials.username == "admin" and credentials.password == "walmart123":
        access_token = create_access_token(data={"sub": credentials.username})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "admin"}
    elif credentials.username == "customer" and credentials.password == "demo123":
        access_token = create_access_token(data={"sub": credentials.username})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "customer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Inventory Management Routes
@app.get("/api/inventory", response_model=List[InventoryItemSchema])
async def get_inventory(db: Session = Depends(get_db)):
    return inventory_service.get_all_inventory(db)

@app.get("/api/inventory/{item_id}", response_model=InventoryItemSchema)
async def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = inventory_service.get_inventory_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/api/inventory", response_model=InventoryItemSchema)
async def create_inventory_item(item: InventoryItemCreateSchema, db: Session = Depends(get_db)):
    return inventory_service.create_inventory_item(db, item)

@app.put("/api/inventory/{item_id}", response_model=InventoryItemSchema)
async def update_inventory_item(item_id: int, item: InventoryItemUpdateSchema, db: Session = Depends(get_db)):
    updated_item = inventory_service.update_inventory_item(db, item_id, item)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@app.get("/api/inventory/low-stock")
async def get_low_stock_items(db: Session = Depends(get_db)):
    return inventory_service.get_low_stock_items(db)

@app.post("/api/inventory/reorder/{item_id}")
async def trigger_reorder(item_id: int, db: Session = Depends(get_db)):
    result = await inventory_service.trigger_automatic_reorder(db, item_id)
    return {"message": "Reorder triggered", "details": result}

# Supply Chain Routes
@app.get("/api/supply-chain/metrics")
async def get_supply_chain_metrics(db: Session = Depends(get_db)):
    return supply_chain_service.get_key_metrics(db)

@app.get("/api/suppliers", response_model=List[SupplierSchema])
async def get_suppliers(db: Session = Depends(get_db)):
    return supply_chain_service.get_all_suppliers(db)

@app.post("/api/suppliers", response_model=SupplierSchema)
async def create_supplier(supplier: SupplierCreateSchema, db: Session = Depends(get_db)):
    return supply_chain_service.create_supplier(db, supplier)

@app.get("/api/warehouses", response_model=List[WarehouseSchema])
async def get_warehouses(db: Session = Depends(get_db)):
    return supply_chain_service.get_all_warehouses(db)

@app.post("/api/optimize-routes")
async def optimize_delivery_routes(db: Session = Depends(get_db)):
    result = await supply_chain_service.optimize_delivery_routes(db)
    return {"message": "Routes optimized", "details": result}

# Order Management Routes
@app.get("/api/orders", response_model=List[OrderSchema])
async def get_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    return supply_chain_service.get_orders(db, status)

@app.post("/api/orders", response_model=OrderSchema)
async def create_order(order: OrderCreateSchema, db: Session = Depends(get_db)):
    return supply_chain_service.create_order(db, order)

@app.get("/api/orders/{order_id}", response_model=OrderSchema)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = supply_chain_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: int, status: OrderStatusUpdateSchema, db: Session = Depends(get_db)):
    updated_order = supply_chain_service.update_order_status(db, order_id, status.status)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order

# Delivery Routes
@app.get("/api/deliveries", response_model=List[DeliverySchema])
async def get_deliveries(status: Optional[str] = None, db: Session = Depends(get_db)):
    return delivery_service.get_deliveries(db, status)

@app.get("/api/deliveries/{delivery_id}", response_model=DeliverySchema)
async def get_delivery(delivery_id: int, db: Session = Depends(get_db)):
    delivery = delivery_service.get_delivery(db, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery

@app.post("/api/deliveries/{delivery_id}/update-location")
async def update_delivery_location(delivery_id: int, location: LocationUpdateSchema, db: Session = Depends(get_db)):
    result = await delivery_service.update_delivery_location(db, delivery_id, location)
    if not result:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return {"message": "Location updated successfully"}

@app.get("/api/deliveries/{delivery_id}/track")
async def track_delivery(delivery_id: int, db: Session = Depends(get_db)):
    tracking_info = delivery_service.get_delivery_tracking(db, delivery_id)
    if not tracking_info:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return tracking_info

# ML and Analytics Routes
@app.get("/api/analytics/demand-forecast")
async def get_demand_forecast(item_id: Optional[int] = None, days: int = 30, db: Session = Depends(get_db)):
    return ml_service.get_demand_forecast(db, item_id, days)

@app.get("/api/analytics/inventory-optimization")
async def get_inventory_optimization(db: Session = Depends(get_db)):
    return ml_service.get_inventory_optimization_recommendations(db)

@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    return {
        "inventory_metrics": inventory_service.get_inventory_metrics(db),
        "supply_chain_metrics": supply_chain_service.get_key_metrics(db),
        "delivery_metrics": delivery_service.get_delivery_metrics(db),
        "ml_insights": ml_service.get_ml_insights(db)
    }

@app.get("/api/analytics/performance")
async def get_performance_metrics(db: Session = Depends(get_db)):
    return {
        "inventory_turnover": ml_service.calculate_inventory_turnover(db),
        "order_fulfillment_rate": supply_chain_service.get_fulfillment_rate(db),
        "delivery_success_rate": delivery_service.get_delivery_success_rate(db),
        "customer_satisfaction": delivery_service.get_customer_satisfaction_score(db)
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Walmart Supply Chain Transformation Platform",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "running"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 