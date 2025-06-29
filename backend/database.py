from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create engine with production-ready configuration
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url, 
        connect_args={"check_same_thread": False},
        echo=settings.environment == "development"
    )
else:
    # PostgreSQL configuration for production
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # Enables pessimistic disconnect handling
        pool_recycle=300,    # Recycle connections every 5 minutes
        pool_size=10,        # Connection pool size
        max_overflow=20,     # Additional connections beyond pool_size
        echo=settings.environment == "development"
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Database dependency
def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 