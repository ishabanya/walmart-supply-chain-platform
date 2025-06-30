from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
import enum

# Inventory Models
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    brand = Column(String(100))
    
    # Inventory levels
    current_stock = Column(Integer, default=0)
    reserved_stock = Column(Integer, default=0)
    available_stock = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    reorder_quantity = Column(Integer, default=100)
    max_stock_level = Column(Integer, default=1000)
    
    # Pricing
    unit_cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    
    # Location
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    aisle = Column(String(10))
    shelf = Column(String(10))
    
    # Tracking
    last_restocked = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    warehouse = relationship("Warehouse", back_populates="inventory_items")
    order_items = relationship("OrderItem", back_populates="inventory_item")
    stock_movements = relationship("StockMovement", back_populates="inventory_item")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    movement_type = Column(String(20))  # IN, OUT, ADJUSTMENT, TRANSFER
    quantity = Column(Integer, nullable=False)
    reference_type = Column(String(50))  # ORDER, RESTOCK, ADJUSTMENT, TRANSFER
    reference_id = Column(Integer)
    reason = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    created_by = Column(String(100))
    
    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="stock_movements")

# Supplier Models
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50))
    zip_code = Column(String(20))
    
    # Performance metrics
    reliability_score = Column(Float, default=5.0)  # 1-10 scale
    average_delivery_time = Column(Integer)  # in days
    quality_rating = Column(Float, default=5.0)  # 1-10 scale
    
    # Contract details
    payment_terms = Column(String(100))
    minimum_order_value = Column(Float)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    # Order details
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, SENT, RECEIVED, CANCELLED
    order_date = Column(DateTime, default=func.now())
    expected_delivery_date = Column(DateTime)
    actual_delivery_date = Column(DateTime)
    
    # Additional details
    notes = Column(Text)
    created_by = Column(String(100))
    approved_by = Column(String(100))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    
    quantity_ordered = Column(Integer, nullable=False)
    quantity_received = Column(Integer, default=0)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="purchase_order_items")
    inventory_item = relationship("InventoryItem")

# Warehouse Models
class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    
    # Location details
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50))
    zip_code = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Warehouse details
    total_capacity = Column(Float)  # in cubic meters
    current_utilization = Column(Float, default=0.0)  # percentage
    
    # Contact information
    manager_name = Column(String(100))
    manager_email = Column(String(100))
    phone = Column(String(20))
    
    # Operational details
    operating_hours = Column(String(100))
    is_active = Column(Boolean, default=True)
    warehouse_type = Column(String(50))  # DISTRIBUTION, FULFILLMENT, CROSS_DOCK
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    inventory_items = relationship("InventoryItem", back_populates="warehouse")
    orders = relationship("Order", back_populates="warehouse")

# Order Models
class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    
    # Address information
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50))
    zip_code = Column(String(20))
    
    # Customer metrics
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    loyalty_points = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    
    # Order details
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    
    # Status tracking
    status = Column(String(20), default="PENDING")  # PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    priority = Column(String(10), default="NORMAL")  # LOW, NORMAL, HIGH, URGENT
    
    # Dates
    order_date = Column(DateTime, default=func.now())
    expected_delivery_date = Column(DateTime)
    shipped_date = Column(DateTime)
    delivered_date = Column(DateTime)
    
    # Shipping details
    shipping_address = Column(Text)
    shipping_city = Column(String(100))
    shipping_state = Column(String(50))
    shipping_zip = Column(String(20))
    shipping_method = Column(String(50))
    
    # Tracking
    tracking_number = Column(String(100))
    notes = Column(Text)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="orders")
    warehouse = relationship("Warehouse", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    deliveries = relationship("Delivery", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    
    # Fulfillment tracking
    quantity_fulfilled = Column(Integer, default=0)
    quantity_cancelled = Column(Integer, default=0)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    inventory_item = relationship("InventoryItem", back_populates="order_items")

# Delivery Models
class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    employee_id = Column(String(20), unique=True)
    email = Column(String(100))
    phone = Column(String(20), nullable=False)
    license_number = Column(String(50), nullable=False)
    
    # Performance metrics
    total_deliveries = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)
    average_rating = Column(Float, default=5.0)
    
    # Status
    is_active = Column(Boolean, default=True)
    current_status = Column(String(20), default="AVAILABLE")  # AVAILABLE, ON_DELIVERY, OFF_DUTY
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    deliveries = relationship("Delivery", back_populates="driver")
    delivery_routes = relationship("DeliveryRoute", back_populates="driver")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String(20), unique=True, nullable=False)
    make = Column(String(50))
    model = Column(String(50))
    year = Column(Integer)
    vehicle_type = Column(String(50))  # VAN, TRUCK, MOTORCYCLE
    
    # Capacity
    max_weight_capacity = Column(Float)  # in kg
    max_volume_capacity = Column(Float)  # in cubic meters
    
    # Status
    is_active = Column(Boolean, default=True)
    current_status = Column(String(20), default="AVAILABLE")  # AVAILABLE, IN_USE, MAINTENANCE
    
    # Location tracking
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    last_location_update = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    deliveries = relationship("Delivery", back_populates="vehicle")

class Delivery(Base):
    __tablename__ = "deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    delivery_number = Column(String(50), unique=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    
    # Delivery details
    status = Column(String(20), default="PENDING")  # PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
    priority = Column(String(10), default="NORMAL")
    
    # Address information
    delivery_address = Column(Text, nullable=False)
    delivery_city = Column(String(100))
    delivery_state = Column(String(50))
    delivery_zip = Column(String(20))
    delivery_latitude = Column(Float)
    delivery_longitude = Column(Float)
    
    # Time tracking
    scheduled_date = Column(DateTime)
    pickup_time = Column(DateTime)
    estimated_arrival = Column(DateTime)
    actual_arrival = Column(DateTime)
    delivery_time = Column(DateTime)
    
    # Delivery details
    delivery_instructions = Column(Text)
    recipient_name = Column(String(100))
    recipient_phone = Column(String(20))
    
    # Tracking
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    last_location_update = Column(DateTime)
    
    # Customer feedback
    customer_rating = Column(Integer)  # 1-5 stars
    customer_feedback = Column(Text)
    
    # Notes and photos
    delivery_notes = Column(Text)
    delivery_photo_url = Column(String(500))
    signature_url = Column(String(500))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="deliveries")
    driver = relationship("Driver", back_populates="deliveries")
    vehicle = relationship("Vehicle", back_populates="deliveries")
    delivery_updates = relationship("DeliveryUpdate", back_populates="delivery")

class DeliveryUpdate(Base):
    __tablename__ = "delivery_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    
    status = Column(String(20), nullable=False)
    message = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    
    created_at = Column(DateTime, default=func.now())
    created_by = Column(String(100))
    
    # Relationships
    delivery = relationship("Delivery", back_populates="delivery_updates")

class DeliveryRoute(Base):
    __tablename__ = "delivery_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    
    # Route details
    start_latitude = Column(Float)
    start_longitude = Column(Float)
    total_distance = Column(Float)  # in kilometers
    estimated_duration = Column(Integer)  # in minutes
    
    # Route optimization
    route_order = Column(JSON)  # List of delivery IDs in order
    optimized_at = Column(DateTime)
    
    # Status
    status = Column(String(20), default="PLANNED")  # PLANNED, IN_PROGRESS, COMPLETED
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    driver = relationship("Driver", back_populates="delivery_routes")

# Analytics Models
class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(50))
    
    # Context
    entity_type = Column(String(50))  # INVENTORY, DELIVERY, SUPPLY_CHAIN
    entity_id = Column(Integer)
    
    # Time period
    measurement_date = Column(DateTime, default=func.now())
    period_type = Column(String(20))  # DAILY, WEEKLY, MONTHLY, YEARLY
    
    created_at = Column(DateTime, default=func.now())

class AlertLog(Base):
    __tablename__ = "alert_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)  # LOW_STOCK, DELIVERY_DELAY, SYSTEM_ERROR
    severity = Column(String(10), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Context
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(100))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# Blockchain Models
class BlockchainNetwork(Base):
    __tablename__ = "blockchain_networks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Ethereum, Polygon, BSC
    chain_id = Column(Integer, nullable=False)
    rpc_url = Column(String(500), nullable=False)
    explorer_url = Column(String(500))
    native_currency = Column(String(20))  # ETH, MATIC, BNB
    
    is_active = Column(Boolean, default=True)
    is_testnet = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    smart_contracts = relationship("SmartContract", back_populates="network")
    blockchain_transactions = relationship("BlockchainTransaction", back_populates="network")

class SmartContract(Base):
    __tablename__ = "smart_contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contract_address = Column(String(42), nullable=False)  # Ethereum address
    network_id = Column(Integer, ForeignKey("blockchain_networks.id"))
    
    # Contract details
    abi = Column(JSON)  # Application Binary Interface
    bytecode = Column(Text)
    contract_type = Column(String(50))  # SUPPLY_CHAIN, TOKEN, NFT
    
    # Deployment details
    deployed_at = Column(DateTime)
    deployed_by = Column(String(42))  # Ethereum address
    deployment_tx_hash = Column(String(66))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    network = relationship("BlockchainNetwork", back_populates="smart_contracts")
    blockchain_transactions = relationship("BlockchainTransaction", back_populates="smart_contract")

class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String(66), unique=True, nullable=False)
    network_id = Column(Integer, ForeignKey("blockchain_networks.id"))
    smart_contract_id = Column(Integer, ForeignKey("smart_contracts.id"))
    
    # Transaction details
    from_address = Column(String(42), nullable=False)
    to_address = Column(String(42), nullable=False)
    function_name = Column(String(100))
    function_parameters = Column(JSON)
    
    # Transaction status
    status = Column(String(20), default="PENDING")  # PENDING, CONFIRMED, FAILED
    block_number = Column(Integer)
    block_hash = Column(String(66))
    gas_used = Column(Integer)
    gas_price = Column(String(50))  # Wei amount as string
    transaction_fee = Column(String(50))  # Wei amount as string
    
    # Business context
    entity_type = Column(String(50))  # PRODUCT, ORDER, SHIPMENT
    entity_id = Column(Integer)
    action_type = Column(String(50))  # CREATE, UPDATE, TRANSFER, VERIFY
    
    # Timing
    submitted_at = Column(DateTime, default=func.now())
    confirmed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    network = relationship("BlockchainNetwork", back_populates="blockchain_transactions")
    smart_contract = relationship("SmartContract", back_populates="blockchain_transactions")

class DigitalProduct(Base):
    __tablename__ = "digital_products"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    
    # Blockchain identifiers
    token_id = Column(Integer)  # NFT token ID
    contract_address = Column(String(42))
    blockchain_id = Column(String(100))  # Unique blockchain identifier
    
    # Product authenticity
    digital_signature = Column(Text)
    authenticity_hash = Column(String(66))
    
    # Tracking
    current_owner = Column(String(42))  # Ethereum address
    origin_timestamp = Column(DateTime)
    
    # Supply chain stages
    manufacturing_verified = Column(Boolean, default=False)
    manufacturing_timestamp = Column(DateTime)
    manufacturing_location = Column(String(255))
    
    distribution_verified = Column(Boolean, default=False)
    distribution_timestamp = Column(DateTime)
    distribution_location = Column(String(255))
    
    retail_verified = Column(Boolean, default=False)
    retail_timestamp = Column(DateTime)
    retail_location = Column(String(255))
    
    # Verification
    is_authentic = Column(Boolean, default=True)
    verification_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    inventory_item = relationship("InventoryItem")
    supply_chain_events = relationship("SupplyChainEvent", back_populates="digital_product")

class SupplyChainEvent(Base):
    __tablename__ = "supply_chain_events"
    
    id = Column(Integer, primary_key=True, index=True)
    digital_product_id = Column(Integer, ForeignKey("digital_products.id"))
    blockchain_transaction_id = Column(Integer, ForeignKey("blockchain_transactions.id"))
    
    # Event details
    event_type = Column(String(50), nullable=False)  # MANUFACTURE, SHIP, RECEIVE, VERIFY, TRANSFER
    event_description = Column(Text)
    
    # Location and time
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    event_timestamp = Column(DateTime, nullable=False)
    
    # Participants
    actor_address = Column(String(42))  # Ethereum address
    actor_name = Column(String(255))
    actor_role = Column(String(50))  # MANUFACTURER, DISTRIBUTOR, RETAILER, CUSTOMER
    
    # Verification
    is_verified = Column(Boolean, default=False)
    verification_hash = Column(String(66))
    
    # Additional data
    metadata = Column(JSON)
    ipfs_hash = Column(String(100))  # For storing documents/images
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    digital_product = relationship("DigitalProduct", back_populates="supply_chain_events")
    blockchain_transaction = relationship("BlockchainTransaction")

class BlockchainWallet(Base):
    __tablename__ = "blockchain_wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String(42), unique=True, nullable=False)
    
    # Wallet details
    wallet_type = Column(String(50))  # SYSTEM, SUPPLIER, DISTRIBUTOR, RETAILER
    entity_type = Column(String(50))  # WAREHOUSE, SUPPLIER, CUSTOMER
    entity_id = Column(Integer)
    
    # Balance tracking (in Wei for precision)
    native_balance = Column(String(50), default="0")
    last_balance_update = Column(DateTime)
    
    # Security
    is_active = Column(Boolean, default=True)
    is_monitored = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class BlockchainIntegration(Base):
    __tablename__ = "blockchain_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_name = Column(String(100), nullable=False)
    
    # Configuration
    network_id = Column(Integer, ForeignKey("blockchain_networks.id"))
    smart_contract_id = Column(Integer, ForeignKey("smart_contracts.id"))
    
    # Integration settings
    auto_sync_enabled = Column(Boolean, default=True)
    sync_frequency = Column(Integer, default=300)  # seconds
    last_sync = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)
    sync_status = Column(String(20), default="IDLE")  # IDLE, SYNCING, ERROR
    last_error = Column(Text)
    
    # Metrics
    total_transactions = Column(Integer, default=0)
    successful_transactions = Column(Integer, default=0)
    failed_transactions = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    network = relationship("BlockchainNetwork")
    smart_contract = relationship("SmartContract")