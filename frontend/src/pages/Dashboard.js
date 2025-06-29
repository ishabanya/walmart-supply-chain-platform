import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  LocalShipping,
  ShoppingCart,
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data for demo
  const stats = [
    {
      title: 'Total Inventory Items',
      value: '1,234',
      change: '+12%',
      icon: <Inventory />,
      color: '#004c91',
    },
    {
      title: 'Active Orders',
      value: '567',
      change: '+5%',
      icon: <ShoppingCart />,
      color: '#ffc220',
    },
    {
      title: 'Deliveries Today',
      value: '89',
      change: '+18%',
      icon: <LocalShipping />,
      color: '#ff6600',
    },
    {
      title: 'Revenue',
      value: '$2.4M',
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
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
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

        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 2 }}>
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