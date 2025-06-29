from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import enum

# Authentication Schemas
class LoginSchema(BaseModel):
    username: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    user_type: str

# Inventory Schemas
class InventoryItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    category: str
    brand: Optional[str] = None
    unit_cost: float
    selling_price: float
    reorder_point: int = 10
    reorder_quantity: int = 100
    max_stock_level: int = 1000
    warehouse_id: Optional[int] = None
    aisle: Optional[str] = None
    shelf: Optional[str] = None

class InventoryItemCreateSchema(InventoryItemBase):
    current_stock: int = 0

class InventoryItemUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    reorder_quantity: Optional[int] = None
    max_stock_level: Optional[int] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None

class InventoryItemSchema(InventoryItemBase):
    id: int
    current_stock: int
    reserved_stock: int
    available_stock: int
    last_restocked: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StockMovementSchema(BaseModel):
    id: int
    inventory_item_id: int
    movement_type: str
    quantity: int
    reference_type: str
    reference_id: Optional[int]
    reason: Optional[str]
    created_at: datetime
    created_by: Optional[str]

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    payment_terms: Optional[str] = None
    minimum_order_value: Optional[float] = None

class SupplierCreateSchema(SupplierBase):
    pass

class SupplierSchema(SupplierBase):
    id: int
    reliability_score: float
    average_delivery_time: Optional[int]
    quality_rating: float
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Warehouse Schemas
class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_capacity: Optional[float] = None
    manager_name: Optional[str] = None
    manager_email: Optional[str] = None
    phone: Optional[str] = None
    operating_hours: Optional[str] = None
    warehouse_type: Optional[str] = None

class WarehouseCreateSchema(WarehouseBase):
    pass

class WarehouseSchema(WarehouseBase):
    id: int
    current_utilization: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None

class CustomerCreateSchema(CustomerBase):
    pass

class CustomerSchema(CustomerBase):
    id: int
    total_orders: int
    total_spent: float
    loyalty_points: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    inventory_item_id: int
    quantity: int
    unit_price: float

class OrderItemSchema(OrderItemBase):
    id: int
    order_id: int
    total_price: float
    discount_amount: float
    quantity_fulfilled: int
    quantity_cancelled: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_id: int
    warehouse_id: int
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_method: Optional[str] = "STANDARD"
    notes: Optional[str] = None

class OrderCreateSchema(OrderBase):
    items: List[OrderItemBase]

class OrderStatusUpdateSchema(BaseModel):
    status: str

class OrderSchema(OrderBase):
    id: int
    order_number: str
    total_amount: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float
    status: str
    priority: str
    order_date: datetime
    expected_delivery_date: Optional[datetime]
    shipped_date: Optional[datetime]
    delivered_date: Optional[datetime]
    tracking_number: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

# Delivery Schemas
class DriverBase(BaseModel):
    first_name: str
    last_name: str
    employee_id: Optional[str] = None
    email: Optional[str] = None
    phone: str
    license_number: str

class DriverSchema(DriverBase):
    id: int
    total_deliveries: int
    successful_deliveries: int
    average_rating: float
    is_active: bool
    current_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    license_plate: str
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[str] = None
    max_weight_capacity: Optional[float] = None
    max_volume_capacity: Optional[float] = None

class VehicleSchema(VehicleBase):
    id: int
    is_active: bool
    current_status: str
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    last_location_update: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeliveryUpdateSchema(BaseModel):
    id: int
    delivery_id: int
    status: str
    message: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    created_by: Optional[str]

    class Config:
        from_attributes = True

class DeliveryBase(BaseModel):
    order_id: int
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_zip: str
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    scheduled_date: Optional[datetime] = None
    delivery_instructions: Optional[str] = None
    recipient_name: str
    recipient_phone: str

class DeliverySchema(DeliveryBase):
    id: int
    delivery_number: str
    driver_id: Optional[int]
    vehicle_id: Optional[int]
    status: str
    priority: str
    pickup_time: Optional[datetime]
    estimated_arrival: Optional[datetime]
    actual_arrival: Optional[datetime]
    delivery_time: Optional[datetime]
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    last_location_update: Optional[datetime]
    customer_rating: Optional[int]
    customer_feedback: Optional[str]
    delivery_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    updates: List[DeliveryUpdateSchema] = []

    class Config:
        from_attributes = True

class LocationUpdateSchema(BaseModel):
    latitude: float
    longitude: float

# Purchase Order Schemas
class PurchaseOrderItemBase(BaseModel):
    inventory_item_id: int
    quantity_ordered: int
    unit_price: float

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    notes: Optional[str] = None

class PurchaseOrderCreateSchema(PurchaseOrderBase):
    items: List[PurchaseOrderItemBase]

class PurchaseOrderItemSchema(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    quantity_received: int
    total_price: float

    class Config:
        from_attributes = True

class PurchaseOrderSchema(PurchaseOrderBase):
    id: int
    po_number: str
    total_amount: float
    status: str
    order_date: datetime
    expected_delivery_date: Optional[datetime]
    actual_delivery_date: Optional[datetime]
    created_by: Optional[str]
    approved_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[PurchaseOrderItemSchema] = []

    class Config:
        from_attributes = True

# Analytics Schemas
class DemandForecastSchema(BaseModel):
    item_id: int
    item_name: str
    forecast_date: datetime
    predicted_demand: float
    confidence_interval: tuple
    model_accuracy: float

class InventoryOptimizationSchema(BaseModel):
    item_id: int
    item_name: str
    current_stock: int
    optimal_stock: int
    reorder_recommendation: str
    cost_savings: float

class PerformanceMetricSchema(BaseModel):
    metric_name: str
    metric_value: float
    metric_unit: Optional[str]
    entity_type: str
    entity_id: Optional[int]
    measurement_date: datetime
    period_type: str

    class Config:
        from_attributes = True

class DashboardAnalyticsSchema(BaseModel):
    inventory_metrics: Dict[str, Any]
    supply_chain_metrics: Dict[str, Any]
    delivery_metrics: Dict[str, Any]
    ml_insights: Dict[str, Any]

class SupplyChainMetricsSchema(BaseModel):
    total_orders: int
    pending_orders: int
    shipped_orders: int
    delivered_orders: int
    average_fulfillment_time: float
    inventory_turnover_rate: float
    supplier_performance: float
    warehouse_utilization: float

class DeliveryMetricsSchema(BaseModel):
    total_deliveries: int
    successful_deliveries: int
    failed_deliveries: int
    average_delivery_time: float
    on_time_delivery_rate: float
    customer_satisfaction_score: float

class AlertSchema(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    message: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Route Optimization Schemas
class DeliveryRouteSchema(BaseModel):
    id: int
    route_name: str
    driver_id: int
    start_latitude: Optional[float]
    start_longitude: Optional[float]
    total_distance: Optional[float]
    estimated_duration: Optional[int]
    route_order: Optional[List[int]]
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RouteOptimizationRequest(BaseModel):
    delivery_ids: List[int]
    start_location: Optional[tuple] = None
    
class RouteOptimizationResponse(BaseModel):
    optimized_route: List[int]
    total_distance: float
    estimated_duration: int
    fuel_savings: float
    time_savings: int 