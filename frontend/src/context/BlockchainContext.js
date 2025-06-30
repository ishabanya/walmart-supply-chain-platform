import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Web3Service from '../services/Web3Service';

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
  participants: {
    rms: [],
    manufacturers: [],
    distributors: [],
    retailers: []
  },
  medicines: [],
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
  CLEAR_ERROR: 'CLEAR_ERROR'
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
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Initialize on mount
  useEffect(() => {
    initializeWeb3();
  }, []);

  const value = {
    ...state,
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
    clearError,
    loadBlockchainData
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