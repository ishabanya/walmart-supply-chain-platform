import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  Search,
  Refresh,
  Add,
  Edit,
  BarChart,
  Close,
  Save
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import RealTimeTracker from '../components/RealTimeTracker';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [metrics, setMetrics] = useState({});
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    unit_price: '',
    current_stock: '',
    min_stock_level: '',
    max_stock_level: '',
    reorder_point: '',
    warehouse_id: '',
    expiry_date: '',
    supplier_id: ''
  });

  useEffect(() => {
    fetchInventoryData();
    fetchMetrics();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory data');
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setMetrics(response.data.inventory_metrics || {});
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      unit_price: '',
      current_stock: '',
      min_stock_level: '',
      max_stock_level: '',
      reorder_point: '',
      warehouse_id: '',
      expiry_date: '',
      supplier_id: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewProduct({
      ...newProduct,
      [field]: event.target.value
    });
  };

  const handleAddProduct = async () => {
    try {
      setAddProductLoading(true);
      
      // Validate required fields
      if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.unit_price) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        setAddProductLoading(false);
        return;
      }

      // Prepare the data
      const productData = {
        ...newProduct,
        unit_price: parseFloat(newProduct.unit_price),
        current_stock: parseInt(newProduct.current_stock) || 0,
        min_stock_level: parseInt(newProduct.min_stock_level) || 0,
        max_stock_level: parseInt(newProduct.max_stock_level) || 100,
        reorder_point: parseInt(newProduct.reorder_point) || 10,
        warehouse_id: parseInt(newProduct.warehouse_id) || 1,
        supplier_id: parseInt(newProduct.supplier_id) || 1
      };

      const response = await axios.post('/api/inventory', productData);
      
      if (response.data) {
        setInventory([...inventory, response.data]);
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
        handleCloseAddDialog();
        await fetchInventoryData(); // Refresh the inventory
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to add product',
        severity: 'error'
      });
    } finally {
      setAddProductLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStockStatus = (item) => {
    if (item.current_stock === 0) return { status: 'Out of Stock', color: 'error', severity: 'high' };
    if (item.current_stock <= item.reorder_point) return { status: 'Low Stock', color: 'warning', severity: 'medium' };
    if (item.current_stock >= item.max_stock_level * 0.8) return { status: 'Overstocked', color: 'info', severity: 'low' };
    return { status: 'In Stock', color: 'success', severity: 'none' };
  };

  const getStockPercentage = (item) => {
    return Math.min((item.current_stock / item.max_stock_level) * 100, 100);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesWarehouse = !warehouseFilter || item.warehouse_id.toString() === warehouseFilter;
    return matchesSearch && matchesCategory && matchesWarehouse;
  });

  const categories = [...new Set(inventory.map(item => item.category))];
  const warehouses = [...new Set(inventory.map(item => ({ id: item.warehouse_id, name: `Warehouse ${item.warehouse_id}` })))];

  const categoryData = categories.map(category => ({
    name: category,
    value: inventory.filter(item => item.category === category).length,
    items: inventory.filter(item => item.category === category).reduce((sum, item) => sum + item.current_stock, 0)
  }));

  const lowStockItems = inventory.filter(item => item.current_stock <= item.reorder_point);
  const outOfStockItems = inventory.filter(item => item.current_stock === 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#004c91' }}>
          Inventory Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchInventoryData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
            sx={{ bgcolor: '#004c91' }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Real-Time Tracker */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <RealTimeTracker type="inventory" />
        </Grid>
      </Grid>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventory.length}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#004c91' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    ${metrics.total_inventory_value?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Availability Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {metrics.stock_availability_rate || 100}%
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {lowStockItems.length} items are below reorder point
          </Typography>
          <Typography variant="body2">
            Items: {lowStockItems.map(item => item.name).join(', ')}
          </Typography>
        </Alert>
      )}

      {outOfStockItems.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {outOfStockItems.length} items are out of stock
          </Typography>
        </Alert>
      )}

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Stock Levels by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="items" fill="#004c91" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={warehouseFilter}
                label="Warehouse"
                onChange={(e) => setWarehouseFilter(e.target.value)}
              >
                <MenuItem value="">All Warehouses</MenuItem>
                {warehouses.map(warehouse => (
                  <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredInventory.length} of {inventory.length} items
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Current Stock</strong></TableCell>
                <TableCell><strong>Stock Level</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const stockPercentage = getStockPercentage(item);
                
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.brand}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {item.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderColor: '#004c91', color: '#004c91' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>{item.current_stock}</strong> / {item.max_stock_level}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available: {item.available_stock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={stockPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: stockPercentage < 20 ? '#f44336' : 
                                      stockPercentage < 50 ? '#ff9800' : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {stockPercentage.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.status}
                        color={stockStatus.color}
                        size="small"
                        variant={stockStatus.severity === 'high' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${(item.current_stock * item.unit_cost).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @ ${item.unit_cost}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        WH-{item.warehouse_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.aisle}-{item.shelf}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" sx={{ color: '#004c91' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Analytics">
                        <IconButton size="small" sx={{ color: '#004c91' }}>
                          <BarChart fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Product Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Add New Product
            </Typography>
            <IconButton onClick={handleCloseAddDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={newProduct.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={newProduct.sku}
                  onChange={handleInputChange('sku')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newProduct.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newProduct.category}
                    label="Category"
                    onChange={handleInputChange('category')}
                  >
                    <MenuItem value="Grocery">Grocery</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Clothing">Clothing</MenuItem>
                    <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                    <MenuItem value="Health & Beauty">Health & Beauty</MenuItem>
                    <MenuItem value="Sports & Outdoors">Sports & Outdoors</MenuItem>
                    <MenuItem value="Automotive">Automotive</MenuItem>
                    <MenuItem value="Toys & Games">Toys & Games</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  value={newProduct.brand}
                  onChange={handleInputChange('brand')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={newProduct.unit_price}
                  onChange={handleInputChange('unit_price')}
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Stock"
                  type="number"
                  value={newProduct.current_stock}
                  onChange={handleInputChange('current_stock')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Stock Level"
                  type="number"
                  value={newProduct.min_stock_level}
                  onChange={handleInputChange('min_stock_level')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Stock Level"
                  type="number"
                  value={newProduct.max_stock_level}
                  onChange={handleInputChange('max_stock_level')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reorder Point"
                  type="number"
                  value={newProduct.reorder_point}
                  onChange={handleInputChange('reorder_point')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={newProduct.warehouse_id}
                    label="Warehouse"
                    onChange={handleInputChange('warehouse_id')}
                  >
                    <MenuItem value={1}>Warehouse 1 - Main</MenuItem>
                    <MenuItem value={2}>Warehouse 2 - Secondary</MenuItem>
                    <MenuItem value={3}>Warehouse 3 - Distribution</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={newProduct.expiry_date}
                  onChange={handleInputChange('expiry_date')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={newProduct.supplier_id}
                    label="Supplier"
                    onChange={handleInputChange('supplier_id')}
                  >
                    <MenuItem value={1}>Supplier 1</MenuItem>
                    <MenuItem value={2}>Supplier 2</MenuItem>
                    <MenuItem value={3}>Supplier 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseAddDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            startIcon={<Save />}
            disabled={addProductLoading}
            sx={{ bgcolor: '#004c91' }}
          >
            {addProductLoading ? <CircularProgress size={20} /> : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Inventory; 