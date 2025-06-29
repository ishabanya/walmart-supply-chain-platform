from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid

from models import (
    InventoryItem, Warehouse, Supplier, Customer, Order, OrderItem,
    Driver, Vehicle, Delivery, StockMovement
)

def initialize_sample_data(db: Session):
    """Initialize the database with sample data for demo purposes."""
    
    # Check if data already exists
    if db.query(InventoryItem).count() > 0:
        print("Sample data already exists, skipping initialization...")
        return
    
    print("🔄 Initializing sample data...")
    
    # Create Warehouses
    warehouses = [
        Warehouse(
            name="Northeast Distribution Center",
            code="NE-DC-01",
            address="123 Industrial Blvd",
            city="Boston",
            state="MA",
            country="USA",
            zip_code="02101",
            latitude=42.3601,
            longitude=-71.0589,
            total_capacity=10000.0,
            current_utilization=65.0,
            manager_name="John Smith",
            manager_email="john.smith@walmart.com",
            phone="(555) 123-4567",
            operating_hours="24/7",
            warehouse_type="DISTRIBUTION"
        ),
        Warehouse(
            name="Southeast Fulfillment Center",
            code="SE-FC-01",
            address="456 Commerce Way",
            city="Atlanta",
            state="GA",
            country="USA",
            zip_code="30301",
            latitude=33.7490,
            longitude=-84.3880,
            total_capacity=8000.0,
            current_utilization=72.0,
            manager_name="Sarah Johnson",
            manager_email="sarah.johnson@walmart.com",
            phone="(555) 234-5678",
            operating_hours="24/7",
            warehouse_type="FULFILLMENT"
        ),
        Warehouse(
            name="West Coast Hub",
            code="WC-HUB-01",
            address="789 Pacific Ave",
            city="Los Angeles",
            state="CA",
            country="USA",
            zip_code="90001",
            latitude=34.0522,
            longitude=-118.2437,
            total_capacity=12000.0,
            current_utilization=58.0,
            manager_name="Mike Chen",
            manager_email="mike.chen@walmart.com",
            phone="(555) 345-6789",
            operating_hours="24/7",
            warehouse_type="DISTRIBUTION"
        )
    ]
    
    for warehouse in warehouses:
        db.add(warehouse)
    db.commit()
    
    # Create Suppliers
    suppliers = [
        Supplier(
            name="Global Electronics Inc",
            contact_person="David Wilson",
            email="david@globalelectronics.com",
            phone="(555) 111-2222",
            address="100 Tech Park Dr",
            city="San Jose",
            state="CA",
            country="USA",
            zip_code="95101",
            reliability_score=8.5,
            average_delivery_time=5,
            quality_rating=9.2,
            payment_terms="Net 30",
            minimum_order_value=1000.0
        ),
        Supplier(
            name="Fashion Forward LLC",
            contact_person="Lisa Rodriguez",
            email="lisa@fashionforward.com",
            phone="(555) 222-3333",
            address="200 Garment District",
            city="New York",
            state="NY",
            country="USA",
            zip_code="10001",
            reliability_score=7.8,
            average_delivery_time=7,
            quality_rating=8.5,
            payment_terms="Net 15",
            minimum_order_value=500.0
        ),
        Supplier(
            name="Home & Garden Supplies",
            contact_person="Robert Taylor",
            email="robert@homegardenco.com",
            phone="(555) 333-4444",
            address="300 Industrial Way",
            city="Phoenix",
            state="AZ",
            country="USA",
            zip_code="85001",
            reliability_score=9.1,
            average_delivery_time=4,
            quality_rating=8.9,
            payment_terms="Net 30",
            minimum_order_value=750.0
        )
    ]
    
    for supplier in suppliers:
        db.add(supplier)
    db.commit()
    
    # Create Inventory Items
    inventory_items = [
        # Electronics
        {"name": "Samsung 65\" 4K Smart TV", "sku": "TV-SAM-65-4K", "category": "Electronics", "brand": "Samsung", 
         "unit_cost": 450.00, "selling_price": 699.99, "current_stock": 25, "reorder_point": 10, "reorder_quantity": 50},
        {"name": "Apple iPhone 15 Pro", "sku": "PHONE-APPL-15P", "category": "Electronics", "brand": "Apple", 
         "unit_cost": 800.00, "selling_price": 1199.99, "current_stock": 45, "reorder_point": 15, "reorder_quantity": 30},
        {"name": "Sony WH-1000XM5 Headphones", "sku": "HEAD-SONY-1000", "category": "Electronics", "brand": "Sony", 
         "unit_cost": 200.00, "selling_price": 349.99, "current_stock": 60, "reorder_point": 20, "reorder_quantity": 100},
        {"name": "Dell XPS 13 Laptop", "sku": "LAPTOP-DELL-XPS13", "category": "Electronics", "brand": "Dell", 
         "unit_cost": 650.00, "selling_price": 999.99, "current_stock": 18, "reorder_point": 8, "reorder_quantity": 25},
        {"name": "Nintendo Switch Console", "sku": "GAME-NINT-SWITCH", "category": "Electronics", "brand": "Nintendo", 
         "unit_cost": 200.00, "selling_price": 299.99, "current_stock": 35, "reorder_point": 12, "reorder_quantity": 40},
        
        # Clothing
        {"name": "Levi's 501 Original Jeans", "sku": "JEAN-LEVI-501", "category": "Clothing", "brand": "Levi's", 
         "unit_cost": 25.00, "selling_price": 59.99, "current_stock": 120, "reorder_point": 50, "reorder_quantity": 200},
        {"name": "Nike Air Force 1 Sneakers", "sku": "SHOE-NIKE-AF1", "category": "Clothing", "brand": "Nike", 
         "unit_cost": 45.00, "selling_price": 89.99, "current_stock": 85, "reorder_point": 30, "reorder_quantity": 150},
        {"name": "Adidas Hoodie", "sku": "HOOD-ADID-CLAS", "category": "Clothing", "brand": "Adidas", 
         "unit_cost": 30.00, "selling_price": 64.99, "current_stock": 95, "reorder_point": 25, "reorder_quantity": 100},
        
        # Home & Garden
        {"name": "KitchenAid Stand Mixer", "sku": "MIXER-KA-STAND", "category": "Home & Garden", "brand": "KitchenAid", 
         "unit_cost": 180.00, "selling_price": 299.99, "current_stock": 30, "reorder_point": 8, "reorder_quantity": 20},
        {"name": "Dyson V15 Vacuum Cleaner", "sku": "VAC-DYSON-V15", "category": "Home & Garden", "brand": "Dyson", 
         "unit_cost": 350.00, "selling_price": 549.99, "current_stock": 22, "reorder_point": 5, "reorder_quantity": 15},
        {"name": "Weber Genesis Gas Grill", "sku": "GRILL-WEB-GEN", "category": "Home & Garden", "brand": "Weber", 
         "unit_cost": 400.00, "selling_price": 649.99, "current_stock": 12, "reorder_point": 3, "reorder_quantity": 10},
        {"name": "Roomba i7+ Robot Vacuum", "sku": "ROBOT-ROOM-I7", "category": "Home & Garden", "brand": "iRobot", 
         "unit_cost": 500.00, "selling_price": 799.99, "current_stock": 8, "reorder_point": 3, "reorder_quantity": 12},
        
        # Sports & Outdoors
        {"name": "Yeti Rambler Tumbler", "sku": "TUMB-YETI-RAMB", "category": "Sports & Outdoors", "brand": "Yeti", 
         "unit_cost": 15.00, "selling_price": 34.99, "current_stock": 150, "reorder_point": 40, "reorder_quantity": 200},
        {"name": "Coleman 6-Person Tent", "sku": "TENT-COLE-6P", "category": "Sports & Outdoors", "brand": "Coleman", 
         "unit_cost": 80.00, "selling_price": 149.99, "current_stock": 25, "reorder_point": 8, "reorder_quantity": 30},
        {"name": "Fitbit Charge 5", "sku": "FIT-FITB-CH5", "category": "Sports & Outdoors", "brand": "Fitbit", 
         "unit_cost": 90.00, "selling_price": 149.99, "current_stock": 40, "reorder_point": 15, "reorder_quantity": 50}
    ]
    
    for i, item_data in enumerate(inventory_items):
        warehouse_id = (i % 3) + 1  # Distribute across warehouses
        
        item = InventoryItem(
            name=item_data["name"],
            sku=item_data["sku"],
            category=item_data["category"],
            brand=item_data["brand"],
            unit_cost=item_data["unit_cost"],
            selling_price=item_data["selling_price"],
            current_stock=item_data["current_stock"],
            reserved_stock=random.randint(0, 5),
            reorder_point=item_data["reorder_point"],
            reorder_quantity=item_data["reorder_quantity"],
            max_stock_level=item_data["reorder_quantity"] * 5,
            warehouse_id=warehouse_id,
            aisle=f"A{random.randint(1, 20)}",
            shelf=f"S{random.randint(1, 10)}",
            description=f"High-quality {item_data['name']} from {item_data['brand']}"
        )
        item.available_stock = item.current_stock - item.reserved_stock
        db.add(item)
    
    db.commit()
    
    # Create Customers
    customers = [
        Customer(
            first_name="Alice", last_name="Johnson", email="alice.johnson@email.com", phone="(555) 100-1001",
            address="123 Main St", city="Boston", state="MA", country="USA", zip_code="02101",
            total_orders=5, total_spent=1250.00, loyalty_points=125
        ),
        Customer(
            first_name="Bob", last_name="Smith", email="bob.smith@email.com", phone="(555) 100-1002",
            address="456 Oak Ave", city="Atlanta", state="GA", country="USA", zip_code="30301",
            total_orders=3, total_spent=899.50, loyalty_points=89
        ),
        Customer(
            first_name="Carol", last_name="Davis", email="carol.davis@email.com", phone="(555) 100-1003",
            address="789 Pine St", city="Los Angeles", state="CA", country="USA", zip_code="90001",
            total_orders=8, total_spent=2100.75, loyalty_points=210
        ),
        Customer(
            first_name="David", last_name="Wilson", email="david.wilson@email.com", phone="(555) 100-1004",
            address="321 Elm Dr", city="Chicago", state="IL", country="USA", zip_code="60601",
            total_orders=2, total_spent=350.00, loyalty_points=35
        ),
        Customer(
            first_name="Emma", last_name="Brown", email="emma.brown@email.com", phone="(555) 100-1005",
            address="654 Maple Ln", city="Seattle", state="WA", country="USA", zip_code="98101",
            total_orders=6, total_spent=1650.25, loyalty_points=165
        )
    ]
    
    for customer in customers:
        db.add(customer)
    db.commit()
    
    # Create Drivers
    drivers = [
        Driver(
            first_name="Mike", last_name="Rodriguez", employee_id="DRV001",
            email="mike.rodriguez@walmart.com", phone="(555) 200-2001",
            license_number="CDL123456", total_deliveries=150, successful_deliveries=145, average_rating=4.8
        ),
        Driver(
            first_name="Sarah", last_name="Thompson", employee_id="DRV002",
            email="sarah.thompson@walmart.com", phone="(555) 200-2002",
            license_number="CDL234567", total_deliveries=120, successful_deliveries=118, average_rating=4.7
        ),
        Driver(
            first_name="James", last_name="Anderson", employee_id="DRV003",
            email="james.anderson@walmart.com", phone="(555) 200-2003",
            license_number="CDL345678", total_deliveries=200, successful_deliveries=195, average_rating=4.9
        ),
        Driver(
            first_name="Lisa", last_name="Garcia", employee_id="DRV004",
            email="lisa.garcia@walmart.com", phone="(555) 200-2004",
            license_number="CDL456789", total_deliveries=80, successful_deliveries=78, average_rating=4.6
        )
    ]
    
    for driver in drivers:
        db.add(driver)
    db.commit()
    
    # Create Vehicles
    vehicles = [
        Vehicle(
            license_plate="WMT001", make="Ford", model="Transit", year=2022, vehicle_type="VAN",
            max_weight_capacity=1500.0, max_volume_capacity=12.0
        ),
        Vehicle(
            license_plate="WMT002", make="Mercedes", model="Sprinter", year=2023, vehicle_type="VAN",
            max_weight_capacity=2000.0, max_volume_capacity=15.0
        ),
        Vehicle(
            license_plate="WMT003", make="Isuzu", model="NPR", year=2021, vehicle_type="TRUCK",
            max_weight_capacity=5000.0, max_volume_capacity=25.0
        ),
        Vehicle(
            license_plate="WMT004", make="Ford", model="E-Series", year=2022, vehicle_type="VAN",
            max_weight_capacity=1800.0, max_volume_capacity=14.0
        ),
        Vehicle(
            license_plate="WMT005", make="Chevrolet", model="Express", year=2023, vehicle_type="VAN",
            max_weight_capacity=1600.0, max_volume_capacity=13.0
        )
    ]
    
    for vehicle in vehicles:
        db.add(vehicle)
    db.commit()
    
    # Create Sample Orders
    for i in range(10):
        customer_id = random.randint(1, 5)
        warehouse_id = random.randint(1, 3)
        order_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
        
        # Random order status
        statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
        weights = [0.2, 0.3, 0.3, 0.2]  # Probability weights
        status = random.choices(statuses, weights=weights)[0]
        
        order = Order(
            order_number=f"ORD-{order_date.strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
            customer_id=customer_id,
            warehouse_id=warehouse_id,
            total_amount=0,  # Will calculate below
            tax_amount=0,
            shipping_cost=15.99,
            status=status,
            priority="NORMAL",
            order_date=order_date,
            expected_delivery_date=order_date + timedelta(days=3),
            shipping_address=f"123 Sample St",
            shipping_city="Sample City",
            shipping_state="SC",
            shipping_zip="12345",
            shipping_method="STANDARD"
        )
        
        if status in ["SHIPPED", "DELIVERED"]:
            order.shipped_date = order_date + timedelta(days=1)
        if status == "DELIVERED":
            order.delivered_date = order_date + timedelta(days=2)
            
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Add order items
        num_items = random.randint(1, 4)
        total_amount = 0
        
        item_ids = random.sample(range(1, 16), num_items)  # Random inventory items
        
        for item_id in item_ids:
            quantity = random.randint(1, 3)
            inventory_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
            unit_price = inventory_item.selling_price
            
            order_item = OrderItem(
                order_id=order.id,
                inventory_item_id=item_id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=quantity * unit_price,
                quantity_fulfilled=quantity if status in ["SHIPPED", "DELIVERED"] else 0
            )
            
            db.add(order_item)
            total_amount += order_item.total_price
        
        # Update order total
        order.total_amount = total_amount
        order.tax_amount = total_amount * 0.08
        
        db.commit()
    
    # Create sample stock movements
    for i in range(50):
        item_id = random.randint(1, 15)
        movement_types = ["IN", "OUT", "ADJUSTMENT"]
        movement_type = random.choice(movement_types)
        quantity = random.randint(1, 20)
        
        movement = StockMovement(
            inventory_item_id=item_id,
            movement_type=movement_type,
            quantity=quantity,
            reference_type="SAMPLE",
            reason="Sample data generation",
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            created_by="SYSTEM"
        )
        
        db.add(movement)
    
    db.commit()
    
    # Create some deliveries for shipped/delivered orders
    shipped_orders = db.query(Order).filter(Order.status.in_(["SHIPPED", "DELIVERED"])).all()
    
    for order in shipped_orders[:5]:  # Create deliveries for first 5 shipped orders
        delivery = Delivery(
            delivery_number=f"DEL-{order.order_date.strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
            order_id=order.id,
            driver_id=random.randint(1, 4),
            vehicle_id=random.randint(1, 5),
            status="DELIVERED" if order.status == "DELIVERED" else "IN_TRANSIT",
            delivery_address=order.shipping_address,
            delivery_city=order.shipping_city,
            delivery_state=order.shipping_state,
            delivery_zip=order.shipping_zip,
            delivery_latitude=40.7128 + random.uniform(-0.1, 0.1),
            delivery_longitude=-74.0060 + random.uniform(-0.1, 0.1),
            recipient_name=f"{order.customer.first_name} {order.customer.last_name}",
            recipient_phone=order.customer.phone,
            scheduled_date=order.expected_delivery_date,
            pickup_time=order.shipped_date,
            delivery_time=order.delivered_date if order.status == "DELIVERED" else None,
            customer_rating=random.randint(4, 5) if order.status == "DELIVERED" else None,
            customer_feedback="Great service!" if order.status == "DELIVERED" else None
        )
        
        db.add(delivery)
    
    db.commit()
    
    print("✅ Sample data initialized successfully!")
    print(f"   - {len(warehouses)} warehouses")
    print(f"   - {len(suppliers)} suppliers") 
    print(f"   - {len(inventory_items)} inventory items")
    print(f"   - {len(customers)} customers")
    print(f"   - {len(drivers)} drivers")
    print(f"   - {len(vehicles)} vehicles")
    print(f"   - 10 sample orders")
    print(f"   - 50 stock movements")
    print(f"   - 5 sample deliveries") 