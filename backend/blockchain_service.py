from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import hashlib
import secrets
from web3 import Web3
from eth_account import Account
import asyncio

# Import models and schemas
from models import (
    BlockchainNetwork, SmartContract, BlockchainTransaction, 
    DigitalProduct, SupplyChainEvent, BlockchainWallet, 
    BlockchainIntegration, InventoryItem
)
from schemas import (
    BlockchainNetworkCreateSchema, SmartContractCreateSchema,
    BlockchainTransactionCreateSchema, BlockchainTransactionUpdateSchema,
    DigitalProductCreateSchema, SupplyChainEventCreateSchema,
    BlockchainWalletCreateSchema, BlockchainIntegrationCreateSchema,
    BlockchainMetricsSchema, Web3ConnectionSchema
)

class BlockchainService:
    def __init__(self):
        self.web3_connections = {}
        self.default_network = None
        self._initialize_default_networks()
    
    def _initialize_default_networks(self):
        """Initialize default blockchain networks"""
        self.default_networks = [
            {
                "name": "Ethereum Mainnet",
                "chain_id": 1,
                "rpc_url": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
                "explorer_url": "https://etherscan.io",
                "native_currency": "ETH",
                "is_testnet": False
            },
            {
                "name": "Ethereum Sepolia",
                "chain_id": 11155111,
                "rpc_url": "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
                "explorer_url": "https://sepolia.etherscan.io",
                "native_currency": "ETH",
                "is_testnet": True
            },
            {
                "name": "Polygon Mumbai",
                "chain_id": 80001,
                "rpc_url": "https://rpc-mumbai.maticvigil.com",
                "explorer_url": "https://mumbai.polygonscan.com",
                "native_currency": "MATIC",
                "is_testnet": True
            }
        ]
    
    # Network Management
    def get_networks(self, db: Session) -> List[BlockchainNetwork]:
        """Get all blockchain networks"""
        return db.query(BlockchainNetwork).filter(BlockchainNetwork.is_active == True).all()
    
    def create_network(self, db: Session, network_data: BlockchainNetworkCreateSchema) -> BlockchainNetwork:
        """Create a new blockchain network"""
        network = BlockchainNetwork(**network_data.dict())
        db.add(network)
        db.commit()
        db.refresh(network)
        return network
    
    def get_web3_connection(self, network_id: int, db: Session) -> Optional[Web3]:
        """Get Web3 connection for a specific network"""
        if network_id in self.web3_connections:
            return self.web3_connections[network_id]
        
        network = db.query(BlockchainNetwork).filter(BlockchainNetwork.id == network_id).first()
        if not network:
            return None
        
        try:
            web3 = Web3(Web3.HTTPProvider(network.rpc_url))
            if web3.is_connected():
                self.web3_connections[network_id] = web3
                return web3
        except Exception as e:
            print(f"Failed to connect to network {network.name}: {e}")
        
        return None
    
    # Smart Contract Management
    def get_smart_contracts(self, db: Session) -> List[SmartContract]:
        """Get all active smart contracts"""
        return db.query(SmartContract).filter(SmartContract.is_active == True).all()
    
    def create_smart_contract(self, db: Session, contract_data: SmartContractCreateSchema) -> SmartContract:
        """Register a new smart contract"""
        contract = SmartContract(**contract_data.dict())
        db.add(contract)
        db.commit()
        db.refresh(contract)
        return contract
    
    def get_contract_instance(self, contract_id: int, db: Session):
        """Get Web3 contract instance"""
        contract = db.query(SmartContract).filter(SmartContract.id == contract_id).first()
        if not contract:
            return None
        
        web3 = self.get_web3_connection(contract.network_id, db)
        if not web3 or not contract.abi:
            return None
        
        try:
            return web3.eth.contract(
                address=contract.contract_address,
                abi=contract.abi
            )
        except Exception as e:
            print(f"Failed to create contract instance: {e}")
            return None
    
    # Transaction Management
    def create_transaction(self, db: Session, tx_data: BlockchainTransactionCreateSchema) -> BlockchainTransaction:
        """Create a new blockchain transaction record"""
        # Generate transaction hash (for demo purposes)
        tx_hash = self._generate_tx_hash(tx_data.dict())
        
        transaction = BlockchainTransaction(
            tx_hash=tx_hash,
            **tx_data.dict()
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
    
    def update_transaction(self, db: Session, tx_id: int, update_data: BlockchainTransactionUpdateSchema) -> Optional[BlockchainTransaction]:
        """Update transaction status"""
        transaction = db.query(BlockchainTransaction).filter(BlockchainTransaction.id == tx_id).first()
        if not transaction:
            return None
        
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(transaction, field, value)
        
        db.commit()
        db.refresh(transaction)
        return transaction
    
    def get_transactions(self, db: Session, limit: int = 100) -> List[BlockchainTransaction]:
        """Get recent blockchain transactions"""
        return db.query(BlockchainTransaction).order_by(
            BlockchainTransaction.created_at.desc()
        ).limit(limit).all()
    
    # Digital Product Management
    def create_digital_product(self, db: Session, product_data: DigitalProductCreateSchema) -> DigitalProduct:
        """Create a digital product on blockchain"""
        # Generate blockchain ID and authenticity hash
        blockchain_id = self._generate_blockchain_id()
        authenticity_hash = self._generate_authenticity_hash(product_data.dict())
        
        digital_product = DigitalProduct(
            blockchain_id=blockchain_id,
            authenticity_hash=authenticity_hash,
            origin_timestamp=datetime.utcnow(),
            **product_data.dict()
        )
        
        db.add(digital_product)
        db.commit()
        db.refresh(digital_product)
        
        # Create initial supply chain event
        self._create_genesis_event(db, digital_product.id)
        
        return digital_product
    
    def verify_product_stage(self, db: Session, product_id: int, stage: str, location: str, verified_by: str) -> bool:
        """Verify a product at a specific supply chain stage"""
        digital_product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
        if not digital_product:
            return False
        
        # Update verification status
        now = datetime.utcnow()
        if stage == "MANUFACTURING":
            digital_product.manufacturing_verified = True
            digital_product.manufacturing_timestamp = now
            digital_product.manufacturing_location = location
        elif stage == "DISTRIBUTION":
            digital_product.distribution_verified = True
            digital_product.distribution_timestamp = now
            digital_product.distribution_location = location
        elif stage == "RETAIL":
            digital_product.retail_verified = True
            digital_product.retail_timestamp = now
            digital_product.retail_location = location
        
        digital_product.verification_count += 1
        
        # Create supply chain event
        event = SupplyChainEvent(
            digital_product_id=product_id,
            event_type=f"VERIFY_{stage}",
            event_description=f"Product verified at {stage.lower()} stage",
            location=location,
            event_timestamp=now,
            actor_name=verified_by,
            actor_role=stage.split("_")[0],
            is_verified=True,
            verification_hash=self._generate_verification_hash(product_id, stage, location)
        )
        
        db.add(event)
        db.commit()
        
        return True
    
    def get_product_tracking_history(self, db: Session, product_id: int) -> List[SupplyChainEvent]:
        """Get complete tracking history for a product"""
        return db.query(SupplyChainEvent).filter(
            SupplyChainEvent.digital_product_id == product_id
        ).order_by(SupplyChainEvent.event_timestamp.asc()).all()
    
    # Supply Chain Events
    def create_supply_chain_event(self, db: Session, event_data: SupplyChainEventCreateSchema) -> SupplyChainEvent:
        """Create a new supply chain event"""
        event = SupplyChainEvent(**event_data.dict())
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    
    # Wallet Management
    def create_wallet(self, db: Session, wallet_data: BlockchainWalletCreateSchema) -> BlockchainWallet:
        """Register a new blockchain wallet"""
        wallet = BlockchainWallet(**wallet_data.dict())
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        return wallet
    
    def get_wallets(self, db: Session) -> List[BlockchainWallet]:
        """Get all registered wallets"""
        return db.query(BlockchainWallet).filter(BlockchainWallet.is_active == True).all()
    
    # Integration Management
    def create_integration(self, db: Session, integration_data: BlockchainIntegrationCreateSchema) -> BlockchainIntegration:
        """Create a new blockchain integration"""
        integration = BlockchainIntegration(**integration_data.dict())
        db.add(integration)
        db.commit()
        db.refresh(integration)
        return integration
    
    async def sync_blockchain_data(self, db: Session, integration_id: int) -> bool:
        """Sync data with blockchain"""
        integration = db.query(BlockchainIntegration).filter(
            BlockchainIntegration.id == integration_id
        ).first()
        
        if not integration:
            return False
        
        try:
            integration.sync_status = "SYNCING"
            integration.last_sync = datetime.utcnow()
            db.commit()
            
            # Simulate blockchain sync
            await asyncio.sleep(2)
            
            integration.sync_status = "IDLE"
            integration.successful_transactions += 1
            db.commit()
            
            return True
        except Exception as e:
            integration.sync_status = "ERROR"
            integration.last_error = str(e)
            integration.failed_transactions += 1
            db.commit()
            return False
    
    # Analytics and Metrics
    def get_blockchain_metrics(self, db: Session) -> Dict[str, Any]:
        """Get blockchain analytics and metrics"""
        total_products = db.query(DigitalProduct).count()
        verified_products = db.query(DigitalProduct).filter(DigitalProduct.is_authentic == True).count()
        total_transactions = db.query(BlockchainTransaction).count()
        successful_transactions = db.query(BlockchainTransaction).filter(
            BlockchainTransaction.status == "CONFIRMED"
        ).count()
        failed_transactions = db.query(BlockchainTransaction).filter(
            BlockchainTransaction.status == "FAILED"
        ).count()
        
        last_sync = db.query(func.max(BlockchainIntegration.last_sync)).scalar()
        
        return {
            "total_products_tracked": total_products,
            "verified_products": verified_products,
            "total_transactions": total_transactions,
            "successful_transactions": successful_transactions,
            "failed_transactions": failed_transactions,
            "network_status": "CONNECTED" if self.web3_connections else "DISCONNECTED",
            "last_sync": last_sync
        }
    
    def get_supply_chain_analytics(self, db: Session) -> Dict[str, Any]:
        """Get supply chain analytics"""
        # Stage completion rates
        total_products = db.query(DigitalProduct).count()
        
        manufacturing_rate = 0
        distribution_rate = 0
        retail_rate = 0
        
        if total_products > 0:
            manufacturing_verified = db.query(DigitalProduct).filter(
                DigitalProduct.manufacturing_verified == True
            ).count()
            distribution_verified = db.query(DigitalProduct).filter(
                DigitalProduct.distribution_verified == True
            ).count()
            retail_verified = db.query(DigitalProduct).filter(
                DigitalProduct.retail_verified == True
            ).count()
            
            manufacturing_rate = (manufacturing_verified / total_products) * 100
            distribution_rate = (distribution_verified / total_products) * 100
            retail_rate = (retail_verified / total_products) * 100
        
        return {
            "total_products": total_products,
            "manufacturing_completion_rate": manufacturing_rate,
            "distribution_completion_rate": distribution_rate,
            "retail_completion_rate": retail_rate,
            "average_verification_time": self._calculate_average_verification_time(db)
        }
    
    # Helper Methods
    def _generate_tx_hash(self, tx_data: Dict) -> str:
        """Generate a mock transaction hash"""
        data_string = json.dumps(tx_data, sort_keys=True)
        return "0x" + hashlib.sha256(data_string.encode()).hexdigest()
    
    def _generate_blockchain_id(self) -> str:
        """Generate a unique blockchain ID"""
        return f"BC_{secrets.token_hex(16).upper()}"
    
    def _generate_authenticity_hash(self, product_data: Dict) -> str:
        """Generate authenticity hash for product"""
        data_string = json.dumps(product_data, sort_keys=True)
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def _generate_verification_hash(self, product_id: int, stage: str, location: str) -> str:
        """Generate verification hash"""
        data = f"{product_id}:{stage}:{location}:{datetime.utcnow().isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _create_genesis_event(self, db: Session, product_id: int):
        """Create the initial supply chain event for a product"""
        event = SupplyChainEvent(
            digital_product_id=product_id,
            event_type="CREATED",
            event_description="Digital product created on blockchain",
            event_timestamp=datetime.utcnow(),
            actor_role="SYSTEM",
            is_verified=True
        )
        db.add(event)
        db.commit()
    
    def _calculate_average_verification_time(self, db: Session) -> float:
        """Calculate average time between verification stages"""
        # Simplified calculation - in real implementation would be more complex
        return 24.5  # hours
    
    # Integration with existing inventory system
    def integrate_with_inventory(self, db: Session, inventory_item_id: int) -> Optional[DigitalProduct]:
        """Create digital product for existing inventory item"""
        inventory_item = db.query(InventoryItem).filter(
            InventoryItem.id == inventory_item_id
        ).first()
        
        if not inventory_item:
            return None
        
        # Create digital product
        digital_product_data = DigitalProductCreateSchema(
            inventory_item_id=inventory_item_id,
            blockchain_id=self._generate_blockchain_id()
        )
        
        return self.create_digital_product(db, digital_product_data)
    
    async def simulate_blockchain_transaction(self, tx_data: Dict) -> Dict[str, Any]:
        """Simulate a blockchain transaction for demo purposes"""
        # Simulate transaction processing time
        await asyncio.sleep(2)
        
        # Generate mock transaction result
        tx_hash = self._generate_tx_hash(tx_data)
        
        return {
            "tx_hash": tx_hash,
            "status": "CONFIRMED",
            "block_number": secrets.randbelow(1000000) + 15000000,
            "gas_used": secrets.randbelow(50000) + 21000,
            "gas_price": "20000000000",  # 20 Gwei
            "transaction_fee": "420000000000000"  # 0.00042 ETH
        } 