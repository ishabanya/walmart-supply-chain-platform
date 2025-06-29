from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "walmart-supply-chain-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token security
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate hash for a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return payload
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception
    
    username = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    return {"username": username, "payload": payload}

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Ensure current user has admin privileges."""
    if current_user["username"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Demo users (in production, this would be in a database)
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "password": "walmart123",  # In production, this should be hashed
        "role": "admin",
        "full_name": "System Administrator"
    },
    "customer": {
        "username": "customer",
        "password": "demo123",  # In production, this should be hashed
        "role": "customer",
        "full_name": "Demo Customer"
    },
    "driver": {
        "username": "driver",
        "password": "drive123",  # In production, this should be hashed
        "role": "driver",
        "full_name": "Demo Driver"
    },
    "manager": {
        "username": "manager",
        "password": "manage123",  # In production, this should be hashed
        "role": "manager",
        "full_name": "Supply Chain Manager"
    }
}

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate user credentials (demo implementation)."""
    user = DEMO_USERS.get(username)
    if not user:
        return None
    
    # In production, verify hashed password
    if user["password"] != password:
        return None
        
    return user

def get_user_permissions(role: str) -> list:
    """Get user permissions based on role."""
    permissions = {
        "admin": [
            "inventory.read", "inventory.write", "inventory.delete",
            "orders.read", "orders.write", "orders.delete",
            "deliveries.read", "deliveries.write", "deliveries.delete",
            "suppliers.read", "suppliers.write", "suppliers.delete",
            "analytics.read", "analytics.write",
            "users.read", "users.write", "users.delete"
        ],
        "manager": [
            "inventory.read", "inventory.write",
            "orders.read", "orders.write",
            "deliveries.read", "deliveries.write",
            "suppliers.read", "suppliers.write",
            "analytics.read"
        ],
        "customer": [
            "orders.read", "deliveries.read"
        ],
        "driver": [
            "deliveries.read", "deliveries.write"
        ]
    }
    return permissions.get(role, [])

def check_permission(user_role: str, required_permission: str) -> bool:
    """Check if user has required permission."""
    user_permissions = get_user_permissions(user_role)
    return required_permission in user_permissions 