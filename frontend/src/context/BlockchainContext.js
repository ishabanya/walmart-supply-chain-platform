import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Web3Service from '../services/Web3Service';
import ApiService from '../services/ApiService';

const BlockchainContext = createContext();

// Initial state
const initialState = {
  web3: null,
  account: null,
  contract: null,
  isConnected: false,
  loading: false,
  error: null,
  networkId: null,
  
  // Traditional blockchain data (medicine supply chain)
  participants: {
    rms: [],
    manufacturers: [],
    distributors: [],
    retailers: []
  },
  medicines: [],
  
  // Backend integrated blockchain data
  digitalProducts: [],
  supplyChainEvents: [],
  blockchainMetrics: null,
  blockchainNetworks: [],
  smartContracts: [],
  wallets: [],
  
  // Combined transactions from both sources
  transactions: []
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WEB3_CONNECTION: 'SET_WEB3_CONNECTION',
  SET_PARTICIPANTS: 'SET_PARTICIPANTS',
  SET_MEDICINES: 'SET_MEDICINES',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Backend integration actions
  SET_DIGITAL_PRODUCTS: 'SET_DIGITAL_PRODUCTS',
  SET_SUPPLY_CHAIN_EVENTS: 'SET_SUPPLY_CHAIN_EVENTS',
  SET_BLOCKCHAIN_METRICS: 'SET_BLOCKCHAIN_METRICS',
  SET_BLOCKCHAIN_NETWORKS: 'SET_BLOCKCHAIN_NETWORKS',
  SET_SMART_CONTRACTS: 'SET_SMART_CONTRACTS',
  SET_WALLETS: 'SET_WALLETS',
  ADD_DIGITAL_PRODUCT: 'ADD_DIGITAL_PRODUCT',
  UPDATE_DIGITAL_PRODUCT: 'UPDATE_DIGITAL_PRODUCT'
};

// Reducer
function blockchainReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_WEB3_CONNECTION:
      return {
        ...state,
        web3: action.payload.web3,
        account: action.payload.account,
        contract: action.payload.contract,
        isConnected: action.payload.isConnected,
        networkId: action.payload.networkId,
        loading: false
      };
    
    case ACTIONS.SET_PARTICIPANTS:
      return {
        ...state,
        participants: { ...state.participants, ...action.payload }
      };
    
    case ACTIONS.SET_MEDICINES:
      return { ...state, medicines: action.payload };
    
    case ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTIONS.SET_DIGITAL_PRODUCTS:
      return { ...state, digitalProducts: action.payload };
    
    case ACTIONS.SET_SUPPLY_CHAIN_EVENTS:
      return { ...state, supplyChainEvents: action.payload };
    
    case ACTIONS.SET_BLOCKCHAIN_METRICS:
      return { ...state, blockchainMetrics: action.payload };
    
    case ACTIONS.SET_BLOCKCHAIN_NETWORKS:
      return { ...state, blockchainNetworks: action.payload };
    
    case ACTIONS.SET_SMART_CONTRACTS:
      return { ...state, smartContracts: action.payload };
    
    case ACTIONS.SET_WALLETS:
      return { ...state, wallets: action.payload };
    
    case ACTIONS.ADD_DIGITAL_PRODUCT:
      return { 
        ...state, 
        digitalProducts: [...state.digitalProducts, action.payload] 
      };
    
    case ACTIONS.UPDATE_DIGITAL_PRODUCT:
      return {
        ...state,
        digitalProducts: state.digitalProducts.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
    
    default:
      return state;
  }
}

// Provider component
export const BlockchainProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blockchainReducer, initialState);

  // Initialize Web3 connection
  const initializeWeb3 = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const isInitialized = await Web3Service.initWeb3();
      
      if (isInitialized) {
        const account = await Web3Service.getCurrentAccount();
        
        dispatch({
          type: ACTIONS.SET_WEB3_CONNECTION,
          payload: {
            web3: Web3Service.web3,
            account,
            contract: Web3Service.contract,
            isConnected: true,
            networkId: 1337 // Local network ID
          }
        });
        
        // Load initial data
        await loadBlockchainData();
      } else {
        throw new Error('Failed to initialize Web3');
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Load blockchain data
  const loadBlockchainData = async () => {
    try {
      // Load medicines
      const medicineCount = await Web3Service.getMedicineCount();
      const medicines = [];
      
      for (let i = 1; i <= medicineCount; i++) {
        const medicine = await Web3Service.getMedicine(i);
        medicines.push({
          id: medicine.id || i,
          name: medicine.name || `Medicine ${i}`,
          description: medicine.description || `Description ${i}`,
          stage: medicine.stage || 'Medicine Ordered',
          rmsId: medicine.rmsId || 0,
          manufacturerId: medicine.manufacturerId || 0,
          distributorId: medicine.distributorId || 0,
          retailerId: medicine.retailerId || 0
        });
      }
      
      dispatch({ type: ACTIONS.SET_MEDICINES, payload: medicines });
      
      // Load participants counts
      const counts = await Web3Service.getCounts();
      console.log('Blockchain data loaded:', { medicineCount, counts });
      
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add participant functions
  const addRMS = async (address, name, place) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.addRMS(address, name, place);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Add RMS',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { name, place }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const addManufacturer = async (address, name, place) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.addManufacturer(address, name, place);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Add Manufacturer',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { name, place }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const addDistributor = async (address, name, place) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.addDistributor(address, name, place);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Add Distributor',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { name, place }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const addRetailer = async (address, name, place) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.addRetailer(address, name, place);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Add Retailer',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { name, place }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Medicine lifecycle functions
  const orderMedicine = async (name, description) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.orderMedicine(name, description);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Order Medicine',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { name, description, medicineId: result.medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const supplyRawMaterial = async (medicineId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.supplyRawMaterial(medicineId);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Supply Raw Material',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const manufacture = async (medicineId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.manufacture(medicineId);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Manufacture',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const distribute = async (medicineId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.distribute(medicineId);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Distribute',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const retail = async (medicineId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.retail(medicineId);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Retail',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const sellMedicine = async (medicineId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await Web3Service.sellMedicine(medicineId);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Sell Medicine',
          hash: result.transactionHash,
          timestamp: new Date(),
          details: { medicineId }
        }
      });
      
      await loadBlockchainData();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Clear error
  // Backend API integration methods
  const loadBackendBlockchainData = async () => {
    try {
      // Load blockchain networks
      const networks = await ApiService.getBlockchainNetworks();
      dispatch({ type: ACTIONS.SET_BLOCKCHAIN_NETWORKS, payload: networks });
      
      // Load smart contracts
      const contracts = await ApiService.getSmartContracts();
      dispatch({ type: ACTIONS.SET_SMART_CONTRACTS, payload: contracts });
      
      // Load digital products
      const digitalProducts = await ApiService.getDigitalProducts();
      dispatch({ type: ACTIONS.SET_DIGITAL_PRODUCTS, payload: digitalProducts });
      
      // Load blockchain metrics
      const metrics = await ApiService.getBlockchainMetrics();
      dispatch({ type: ACTIONS.SET_BLOCKCHAIN_METRICS, payload: metrics });
      
      // Load blockchain transactions
      const backendTransactions = await ApiService.getBlockchainTransactions(50);
      
      // Convert backend transactions to frontend format
      const formattedTransactions = backendTransactions.map(tx => ({
        type: tx.action_type || 'Blockchain Transaction',
        hash: tx.tx_hash,
        timestamp: new Date(tx.created_at),
        details: {
          function: tx.function_name,
          status: tx.status,
          entity_type: tx.entity_type,
          entity_id: tx.entity_id
        }
      }));
      
      // Merge with existing transactions
      dispatch({ 
        type: ACTIONS.ADD_TRANSACTION, 
        payload: formattedTransactions 
      });
      
    } catch (error) {
      console.error('Error loading backend blockchain data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const createDigitalProduct = async (inventoryItemId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const product = await ApiService.createDigitalProduct({
        inventory_item_id: inventoryItemId
      });
      
      dispatch({ type: ACTIONS.ADD_DIGITAL_PRODUCT, payload: product });
      
      // Add transaction record
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Create Digital Product',
          hash: `0x${Math.random().toString(16).substr(2, 16)}`,
          timestamp: new Date(),
          details: { 
            product_id: product.id,
            inventory_item_id: inventoryItemId 
          }
        }
      });
      
      return product;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const verifyProductStage = async (productId, stage, location, verifiedBy) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      await ApiService.verifyProductStage(productId, {
        stage,
        location,
        verified_by: verifiedBy,
        verification_hash: `0x${Math.random().toString(16).substr(2, 16)}`
      });
      
      // Reload the product
      const updatedProduct = await ApiService.getDigitalProduct(productId);
      dispatch({ type: ACTIONS.UPDATE_DIGITAL_PRODUCT, payload: updatedProduct });
      
      // Add transaction record
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: `Verify ${stage}`,
          hash: `0x${Math.random().toString(16).substr(2, 16)}`,
          timestamp: new Date(),
          details: { 
            product_id: productId,
            stage,
            location,
            verified_by: verifiedBy
          }
        }
      });
      
      return true;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const integrateInventoryWithBlockchain = async (inventoryItemId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await ApiService.integrateInventoryWithBlockchain(inventoryItemId);
      
      // Reload digital products
      await loadBackendBlockchainData();
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Integrate Inventory',
          hash: `0x${Math.random().toString(16).substr(2, 16)}`,
          timestamp: new Date(),
          details: { 
            inventory_item_id: inventoryItemId,
            digital_product_id: result.digital_product_id
          }
        }
      });
      
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const simulateTransaction = async (txData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await ApiService.simulateBlockchainTransaction(txData);
      
      dispatch({
        type: ACTIONS.ADD_TRANSACTION,
        payload: {
          type: 'Simulated Transaction',
          hash: result.tx_hash,
          timestamp: new Date(),
          details: result
        }
      });
      
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const getProductTrackingHistory = async (productId) => {
    try {
      return await ApiService.getProductTrackingHistory(productId);
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      await initializeWeb3();
      await loadBackendBlockchainData();
    };
    
    initialize();
  }, [initializeWeb3, loadBackendBlockchainData]);

  const value = {
    ...state,
    
    // Web3 methods (existing)
    initializeWeb3,
    addRMS,
    addManufacturer,
    addDistributor,
    addRetailer,
    orderMedicine,
    supplyRawMaterial,
    manufacture,
    distribute,
    retail,
    sellMedicine,
    loadBlockchainData,
    
    // Backend API methods (new)
    loadBackendBlockchainData,
    createDigitalProduct,
    verifyProductStage,
    integrateInventoryWithBlockchain,
    simulateTransaction,
    getProductTrackingHistory,
    
    // Utility methods
    clearError
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Custom hook
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export default BlockchainContext; 