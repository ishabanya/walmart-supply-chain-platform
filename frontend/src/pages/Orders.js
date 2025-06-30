import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Schedule,
  Cancel,
  Visibility,
  Add,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ApiService from '../services/ApiService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    items: []
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const [chartData, setChartData] = useState([]);

  // Sample data for orders (fallback if API fails)
  const sampleOrders = [
    {
      id: 1001,
      order_number: 'ORD-1001',
      customer_name: 'John Smith',
      customer_email: 'john.smith@email.com',
      customer_phone: '+1-555-0123',
      customer_address: '123 Main St, New York, NY 10001',
      total_amount: 299.99,
      status: 'DELIVERED',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      items: [
        { name: 'Organic Bananas', quantity: 5, unit_price: 2.99 },
        { name: 'Whole Wheat Bread', quantity: 2, unit_price: 3.49 },
        { name: 'Greek Yogurt 32oz', quantity: 1, unit_price: 6.99 }
      ]
    },
    {
      id: 1002,
      order_number: 'ORD-1002',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.j@email.com',
      customer_phone: '+1-555-0124',
      customer_address: '456 Oak Ave, Los Angeles, CA 90210',
      total_amount: 156.75,
      status: 'SHIPPED',
      created_at: '2024-01-16T09:15:00Z',
      updated_at: '2024-01-16T16:45:00Z',
      items: [
        { name: 'Chicken Breast 2lbs', quantity: 1, unit_price: 12.99 },
        { name: 'Mixed Vegetables', quantity: 3, unit_price: 4.49 },
        { name: 'Brown Rice 5lbs', quantity: 1, unit_price: 8.99 }
      ]
    },
    {
      id: 1003,
      order_number: 'ORD-1003',
      customer_name: 'Mike Davis',
      customer_email: 'mike.davis@email.com',
      customer_phone: '+1-555-0125',
      customer_address: '789 Pine St, Chicago, IL 60601',
      total_amount: 89.50,
      status: 'PROCESSING',
      created_at: '2024-01-17T11:00:00Z',
      updated_at: '2024-01-17T11:00:00Z',
      items: [
        { name: 'Pasta Sauce', quantity: 4, unit_price: 3.99 },
        { name: 'Spaghetti Pasta', quantity: 2, unit_price: 2.49 },
        { name: 'Parmesan Cheese', quantity: 1, unit_price: 7.99 }
      ]
    },
    {
      id: 1004,
      order_number: 'ORD-1004',
      customer_name: 'Emily Wilson',
      customer_email: 'emily.w@email.com',
      customer_phone: '+1-555-0126',
      customer_address: '321 Elm St, Miami, FL 33101',
      total_amount: 234.80,
      status: 'PENDING',
      created_at: '2024-01-17T14:30:00Z',
      updated_at: '2024-01-17T14:30:00Z',
      items: [
        { name: 'Fresh Salmon Fillet', quantity: 2, unit_price: 15.99 },
        { name: 'Asparagus Bundle', quantity: 1, unit_price: 4.99 },
        { name: 'Quinoa 2lbs', quantity: 1, unit_price: 9.99 }
      ]
    },
    {
      id: 1005,
      order_number: 'ORD-1005',
      customer_name: 'Robert Brown',
      customer_email: 'rob.brown@email.com',
      customer_phone: '+1-555-0127',
      customer_address: '654 Maple Dr, Seattle, WA 98101',
      total_amount: 67.25,
      status: 'CANCELLED',
      created_at: '2024-01-16T16:20:00Z',
      updated_at: '2024-01-17T09:15:00Z',
      items: [
        { name: 'Protein Bars (12 pack)', quantity: 1, unit_price: 24.99 },
        { name: 'Almond Milk 64oz', quantity: 2, unit_price: 4.99 }
      ]
    }
  ];

  // Sample inventory items for order creation
  const sampleInventoryItems = [
    { id: 1, name: 'Organic Bananas', price: 2.99, category: 'Produce', stock: 150 },
    { id: 2, name: 'Whole Wheat Bread', price: 3.49, category: 'Bakery', stock: 75 },
    { id: 3, name: 'Greek Yogurt 32oz', price: 6.99, category: 'Dairy', stock: 45 },
    { id: 4, name: 'Chicken Breast 2lbs', price: 12.99, category: 'Meat', stock: 30 },
    { id: 5, name: 'Mixed Vegetables', price: 4.49, category: 'Frozen', stock: 60 },
    { id: 6, name: 'Brown Rice 5lbs', price: 8.99, category: 'Pantry', stock: 25 },
    { id: 7, name: 'Pasta Sauce', price: 3.99, category: 'Pantry', stock: 80 },
    { id: 8, name: 'Spaghetti Pasta', price: 2.49, category: 'Pantry', stock: 90 },
    { id: 9, name: 'Parmesan Cheese', price: 7.99, category: 'Dairy', stock: 35 },
    { id: 10, name: 'Fresh Salmon Fillet', price: 15.99, category: 'Seafood', stock: 20 },
    { id: 11, name: 'Asparagus Bundle', price: 4.99, category: 'Produce', stock: 40 },
    { id: 12, name: 'Quinoa 2lbs', price: 9.99, category: 'Pantry', stock: 15 },
    { id: 13, name: 'Protein Bars (12 pack)', price: 24.99, category: 'Health', stock: 25 },
    { id: 14, name: 'Almond Milk 64oz', price: 4.99, category: 'Dairy', stock: 55 },
    { id: 15, name: 'Avocados (4 pack)', price: 5.99, category: 'Produce', stock: 70 },
    { id: 16, name: 'Ground Beef 1lb', price: 8.99, category: 'Meat', stock: 40 },
    { id: 17, name: 'Spinach Leaves', price: 3.99, category: 'Produce', stock: 85 },
    { id: 18, name: 'Cheddar Cheese Block', price: 6.49, category: 'Dairy', stock: 50 },
    { id: 19, name: 'Olive Oil 500ml', price: 12.99, category: 'Pantry', stock: 30 },
    { id: 20, name: 'Orange Juice 64oz', price: 4.79, category: 'Beverages', stock: 65 }
  ];

  const filterOrders = useCallback(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first, fallback to sample data
      let ordersData;
      try {
        ordersData = await ApiService.getOrders();
        console.log('Loaded orders from API:', ordersData.length);
      } catch (apiError) {
        console.log('API not available, using sample data');
        ordersData = sampleOrders;
      }
      
      setOrders(ordersData);

      // Calculate stats
      const stats = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'PENDING').length,
        processing: ordersData.filter(o => o.status === 'PROCESSING').length,
        shipped: ordersData.filter(o => o.status === 'SHIPPED').length,
        delivered: ordersData.filter(o => o.status === 'DELIVERED').length,
        cancelled: ordersData.filter(o => o.status === 'CANCELLED').length
      };
      setOrderStats(stats);

      // Prepare chart data (orders by date)
      const ordersByDate = ordersData.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(ordersByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7) // Last 7 days
        .map(([date, count]) => ({ date, orders: count }));

      setChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to sample data if everything fails
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      // Try to fetch inventory from API first, fallback to sample data
      let inventoryData;
      try {
        inventoryData = await ApiService.getInventory();
        console.log('Loaded inventory from API:', inventoryData.length);
      } catch (apiError) {
        console.log('API not available, using sample inventory data');
        inventoryData = sampleInventoryItems;
      }
      setInventoryItems(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryItems(sampleInventoryItems);
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    fetchInventoryItems(); // Load inventory when opening add dialog
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form
    setNewOrder({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      shipping_address: '',
      shipping_city: '',
      shipping_state: '',
      shipping_zip: '',
      items: []
    });
  };

  const handleAddItemToOrder = (item, quantity) => {
    const existingItemIndex = newOrder.items.findIndex(orderItem => orderItem.inventory_item_id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].quantity += quantity;
      setNewOrder({ ...newOrder, items: updatedItems });
    } else {
      // Add new item
      const newItem = {
        inventory_item_id: item.id,
        name: item.name,
        quantity: quantity,
        unit_price: item.selling_price || item.price,
        total_price: (item.selling_price || item.price) * quantity
      };
      setNewOrder({ ...newOrder, items: [...newOrder.items, newItem] });
    }
  };

  const handleRemoveItemFromOrder = (itemIndex) => {
    const updatedItems = newOrder.items.filter((_, index) => index !== itemIndex);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const calculateOrderTotal = () => {
    return newOrder.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        ...newOrder,
        total_amount: calculateOrderTotal(),
        tax_amount: calculateOrderTotal() * 0.08, // 8% tax
        shipping_cost: 5.99,
        warehouse_id: 1 // Default warehouse
      };

      try {
        const createdOrder = await ApiService.createOrder(orderData);
        console.log('Order created successfully:', createdOrder);
        
        // Refresh orders list
        await fetchOrders();
        
        // Close dialog
        handleCloseAddDialog();
        
        // Show success message (you could add a snackbar here)
        alert('Order created successfully!');
        
      } catch (apiError) {
        console.log('API not available, adding to local state');
        
        // Create mock order for demo
        const mockOrder = {
          id: Math.max(...orders.map(o => o.id), 1000) + 1,
          order_number: `ORD-${Math.max(...orders.map(o => o.id), 1000) + 1}`,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address,
          total_amount: calculateOrderTotal(),
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: newOrder.items
        };
        
        // Add to local state
        setOrders([mockOrder, ...orders]);
        
        // Close dialog
        handleCloseAddDialog();
        
        alert('Order created successfully (demo mode)!');
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Schedule />,
      PROCESSING: <ShoppingCart />,
      SHIPPED: <LocalShipping />,
      DELIVERED: <CheckCircle />,
      CANCELLED: <Cancel />
    };
    return icons[status] || <Schedule />;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} sx={{ color: '#004c91' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#004c91' }}>
        Order Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                {orderStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {orderStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                {orderStats.processing}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ffc220', fontWeight: 'bold' }}>
                {orderStats.shipped}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shipped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {orderStats.delivered}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                {orderStats.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Order Trends (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#004c91" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Orders"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, customer name, or email"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
                sx={{ backgroundColor: '#004c91' }}
              >
                New Order
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.customer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewOrder(order)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details - #{selectedOrder.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Customer Information
                  </Typography>
                  <Typography><strong>Name:</strong> {selectedOrder.customer_name}</Typography>
                  <Typography><strong>Email:</strong> {selectedOrder.customer_email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedOrder.customer_phone}</Typography>
                  <Typography><strong>Address:</strong> {selectedOrder.customer_address}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Order Information
                  </Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip
                      icon={getStatusIcon(selectedOrder.status)}
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</Typography>
                  <Typography><strong>Created:</strong> {formatDate(selectedOrder.created_at)}</Typography>
                  <Typography><strong>Updated:</strong> {formatDate(selectedOrder.updated_at)}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Order Items
              </Typography>
              <List>
                {selectedOrder.items.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.name} (x${item.quantity})`}
                      secondary={`Unit Price: $${item.unit_price} - Subtotal: $${(item.quantity * item.unit_price).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button variant="contained" sx={{ backgroundColor: '#004c91' }}>
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add New Order Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004c91' }}>
            Create New Order
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Customer Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newOrder.customer_email}
                onChange={(e) => setNewOrder({ ...newOrder, customer_email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Address"
                value={newOrder.customer_address}
                onChange={(e) => setNewOrder({ ...newOrder, customer_address: e.target.value })}
                required
              />
            </Grid>

            {/* Shipping Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Shipping Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Shipping Address"
                value={newOrder.shipping_address}
                onChange={(e) => setNewOrder({ ...newOrder, shipping_address: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={newOrder.shipping_city}
                onChange={(e) => setNewOrder({ ...newOrder, shipping_city: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={newOrder.shipping_state}
                onChange={(e) => setNewOrder({ ...newOrder, shipping_state: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={newOrder.shipping_zip}
                onChange={(e) => setNewOrder({ ...newOrder, shipping_zip: e.target.value })}
                required
              />
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Order Items
              </Typography>
            </Grid>

            {/* Current Order Items */}
            {newOrder.items.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Current Items
                  </Typography>
                  <List>
                    {newOrder.items.map((item, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={`${item.name} (x${item.quantity})`}
                          secondary={`Unit Price: $${item.unit_price.toFixed(2)} - Subtotal: $${(item.quantity * item.unit_price).toFixed(2)}`}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItemFromOrder(index)}
                        >
                          Remove
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004c91' }}>
                      Total: ${calculateOrderTotal().toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tax (8%): ${(calculateOrderTotal() * 0.08).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shipping: $5.99
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004c91' }}>
                      Grand Total: ${(calculateOrderTotal() + calculateOrderTotal() * 0.08 + 5.99).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Available Inventory Items */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Available Items
                </Typography>
                <Grid container spacing={1}>
                  {inventoryItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            ${(item.selling_price || item.price).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                            Stock: {item.current_stock || item.stock} | {item.category}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              type="number"
                              label="Qty"
                              defaultValue={1}
                              inputProps={{ min: 1, max: item.current_stock || item.stock }}
                              sx={{ width: 80 }}
                              id={`qty-${item.id}`}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const qty = parseInt(document.getElementById(`qty-${item.id}`).value) || 1;
                                handleAddItemToOrder(item, qty);
                              }}
                              disabled={!item.current_stock && !item.stock}
                            >
                              Add
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitOrder}
            disabled={!newOrder.customer_name || !newOrder.customer_email || newOrder.items.length === 0}
            sx={{ backgroundColor: '#004c91' }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders; 