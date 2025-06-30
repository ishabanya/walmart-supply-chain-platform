import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  LocalShipping,
  ShoppingCart,
  Warning,
  CheckCircle,
  Schedule,
  Business,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    activeOrders: 0,
    deliveries: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    performanceScore: 0
  });
  const [inventoryData, setInventoryData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, ordersRes, deliveriesRes, analyticsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/inventory/items`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/orders`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/deliveries`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/performance`)
      ]);

      const inventory = inventoryRes.data;
      const orders = ordersRes.data;
      const deliveries = deliveriesRes.data;
      const performance = analyticsRes.data;

      // Calculate stats
      const totalValue = inventory.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const lowStock = inventory.filter(item => item.quantity < item.min_stock_level).length;
      const activeOrders = orders.filter(order => 
        ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
      ).length;
      const todayDeliveries = deliveries.filter(delivery => {
        const today = new Date().toDateString();
        return new Date(delivery.created_at).toDateString() === today;
      }).length;

      setStats({
        totalItems: inventory.length,
        activeOrders,
        deliveries: todayDeliveries,
        inventoryValue: totalValue,
        lowStockItems: lowStock,
        performanceScore: performance.overall_score || 92.8
      });

      // Prepare chart data
      const categoryData = inventory.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      setInventoryData(Object.entries(categoryData).map(([name, value]) => ({ name, value })));

      const statusData = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      setOrderData(Object.entries(statusData).map(([name, value]) => ({ name, value })));

      const deliveryStatusData = deliveries.reduce((acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      }, {});

      setDeliveryData(Object.entries(deliveryStatusData).map(([name, value]) => ({ name, value })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#004c91', '#ffc220', '#ff6600', '#4caf50', '#f44336', '#9c27b0'];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} sx={{ color: '#004c91' }} />
        </Box>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Inventory Items',
      value: stats.totalItems.toLocaleString(),
      change: '+12%',
      icon: <Inventory />,
      color: '#004c91',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders.toLocaleString(),
      change: '+5%',
      icon: <ShoppingCart />,
      color: '#ffc220',
    },
    {
      title: 'Deliveries Today',
      value: stats.deliveries.toLocaleString(),
      change: '+18%',
      icon: <LocalShipping />,
      color: '#ff6600',
    },
    {
      title: 'Inventory Value',
      value: `$${(stats.inventoryValue / 1000).toFixed(1)}K`,
      change: '+8%',
      icon: <TrendingUp />,
      color: '#4caf50',
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#004c91' }}>
        Supply Chain Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      color: 'white',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  {stat.change} from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Performance Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#004c91', fontWeight: 'bold' }}>
                Overall Performance Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold', mr: 2 }}>
                  {stats.performanceScore.toFixed(1)}%
                </Typography>
                <CheckCircle sx={{ color: '#4caf50', fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.performanceScore}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                    borderRadius: 5,
                  },
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ color: '#ff6600', mr: 1 }} />
                  <Typography variant="body2">
                    {stats.lowStockItems} Low Stock Items
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Updated 5 min ago
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Categories Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Inventory by Category
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Order Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#004c91" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Delivery Status Overview
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ffc220" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#004c91' }}>
              Welcome to Walmart Supply Chain Platform
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Transform your retail supply chain with our comprehensive platform featuring:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Real-time inventory management</li>
                  <li>AI-powered demand forecasting</li>
                  <li>Automated order processing</li>
                  <li>Live delivery tracking</li>
                </ul>
              </Grid>
              <Grid item xs={12} md={6}>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Advanced analytics and insights</li>
                  <li>Supplier relationship management</li>
                  <li>Route optimization</li>
                  <li>Performance monitoring</li>
                </ul>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 