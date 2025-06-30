// API Service for Backend Communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Authentication
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  // Inventory APIs
  async getInventory() {
    return this.get('/api/inventory');
  }

  async getInventoryItem(itemId) {
    return this.get(`/api/inventory/${itemId}`);
  }

  async createInventoryItem(item) {
    return this.post('/api/inventory', item);
  }

  async updateInventoryItem(itemId, item) {
    return this.put(`/api/inventory/${itemId}`, item);
  }

  async getLowStockItems() {
    return this.get('/api/inventory/low-stock');
  }

  async triggerReorder(itemId) {
    return this.post(`/api/inventory/reorder/${itemId}`);
  }

  // Supply Chain APIs
  async getSupplyChainMetrics() {
    return this.get('/api/supply-chain/metrics');
  }

  async getSuppliers() {
    return this.get('/api/suppliers');
  }

  async createSupplier(supplier) {
    return this.post('/api/suppliers', supplier);
  }

  async getWarehouses() {
    return this.get('/api/warehouses');
  }

  async optimizeRoutes() {
    return this.post('/api/optimize-routes');
  }

  // Order APIs
  async getOrders(status = null) {
    const endpoint = status ? `/api/orders?status=${status}` : '/api/orders';
    return this.get(endpoint);
  }

  async createOrder(order) {
    return this.post('/api/orders', order);
  }

  async getOrder(orderId) {
    return this.get(`/api/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.put(`/api/orders/${orderId}/status`, { status });
  }

  // Delivery APIs
  async getDeliveries(status = null) {
    const endpoint = status ? `/api/deliveries?status=${status}` : '/api/deliveries';
    return this.get(endpoint);
  }

  async getDelivery(deliveryId) {
    return this.get(`/api/deliveries/${deliveryId}`);
  }

  async updateDeliveryLocation(deliveryId, location) {
    return this.post(`/api/deliveries/${deliveryId}/update-location`, location);
  }

  async trackDelivery(deliveryId) {
    return this.get(`/api/deliveries/${deliveryId}/track`);
  }

  // Analytics APIs
  async getDemandForecast(itemId = null, days = 30) {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId);
    params.append('days', days);
    return this.get(`/api/analytics/demand-forecast?${params}`);
  }

  async getInventoryOptimization() {
    return this.get('/api/analytics/inventory-optimization');
  }

  async getDashboardAnalytics() {
    return this.get('/api/analytics/dashboard');
  }

  async getPerformanceMetrics() {
    return this.get('/api/analytics/performance');
  }

  // Blockchain APIs
  async getBlockchainNetworks() {
    return this.get('/api/blockchain/networks');
  }

  async createBlockchainNetwork(network) {
    return this.post('/api/blockchain/networks', network);
  }

  async getSmartContracts() {
    return this.get('/api/blockchain/contracts');
  }

  async createSmartContract(contract) {
    return this.post('/api/blockchain/contracts', contract);
  }

  async getBlockchainTransactions(limit = 100) {
    return this.get(`/api/blockchain/transactions?limit=${limit}`);
  }

  async createBlockchainTransaction(transaction) {
    return this.post('/api/blockchain/transactions', transaction);
  }

  async updateBlockchainTransaction(txId, updateData) {
    return this.put(`/api/blockchain/transactions/${txId}`, updateData);
  }

  async getDigitalProducts() {
    return this.get('/api/blockchain/digital-products');
  }

  async createDigitalProduct(product) {
    return this.post('/api/blockchain/digital-products', product);
  }

  async getDigitalProduct(productId) {
    return this.get(`/api/blockchain/digital-products/${productId}`);
  }

  async verifyProductStage(productId, verification) {
    return this.post(`/api/blockchain/digital-products/${productId}/verify`, verification);
  }

  async getProductTrackingHistory(productId) {
    return this.get(`/api/blockchain/digital-products/${productId}/tracking`);
  }

  async createSupplyChainEvent(event) {
    return this.post('/api/blockchain/supply-chain-events', event);
  }

  async getBlockchainWallets() {
    return this.get('/api/blockchain/wallets');
  }

  async createBlockchainWallet(wallet) {
    return this.post('/api/blockchain/wallets', wallet);
  }

  async getBlockchainIntegrations() {
    return this.get('/api/blockchain/integrations');
  }

  async createBlockchainIntegration(integration) {
    return this.post('/api/blockchain/integrations', integration);
  }

  async syncBlockchainIntegration(integrationId) {
    return this.post(`/api/blockchain/integrations/${integrationId}/sync`);
  }

  async getBlockchainMetrics() {
    return this.get('/api/blockchain/metrics');
  }

  async getBlockchainSupplyChainAnalytics() {
    return this.get('/api/blockchain/supply-chain-analytics');
  }

  async integrateInventoryWithBlockchain(itemId) {
    return this.post(`/api/blockchain/inventory/${itemId}/integrate`);
  }

  async simulateBlockchainTransaction(txData) {
    return this.post('/api/blockchain/simulate-transaction', txData);
  }

  async getBlockchainConnectionStatus() {
    return this.get('/api/blockchain/connection-status');
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Get system status
  async getSystemStatus() {
    return this.get('/');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 