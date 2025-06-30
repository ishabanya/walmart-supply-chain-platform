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
  LinearProgress,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LocalShipping,
  Schedule,
  CheckCircle,
  Cancel,
  DirectionsCar,
  LocationOn,
  Timer,
  Visibility,
  Phone,
  Email,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    pending: 0,
    in_transit: 0,
    delivered: 0,
    failed: 0,
    avgDeliveryTime: 0
  });
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchTerm, statusFilter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deliveries`);
      const deliveriesData = response.data;
      setDeliveries(deliveriesData);

      // Calculate stats
      const stats = {
        total: deliveriesData.length,
        pending: deliveriesData.filter(d => d.status === 'PENDING').length,
        in_transit: deliveriesData.filter(d => d.status === 'IN_TRANSIT').length,
        delivered: deliveriesData.filter(d => d.status === 'DELIVERED').length,
        failed: deliveriesData.filter(d => d.status === 'FAILED').length,
        avgDeliveryTime: 2.5 // Mock average delivery time in hours
      };
      setDeliveryStats(stats);

      // Prepare chart data (deliveries by date)
      const deliveriesByDate = deliveriesData.reduce((acc, delivery) => {
        const date = new Date(delivery.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(deliveriesByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7) // Last 7 days
        .map(([date, count]) => ({ date, deliveries: count }));

      setChartData(chartData);

      // Status distribution data
      const statusData = [
        { name: 'Pending', value: stats.pending, color: '#ff9800' },
        { name: 'In Transit', value: stats.in_transit, color: '#2196f3' },
        { name: 'Delivered', value: stats.delivered, color: '#4caf50' },
        { name: 'Failed', value: stats.failed, color: '#f44336' }
      ];
      setStatusData(statusData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    if (searchTerm) {
      filtered = filtered.filter(delivery =>
        delivery.id.toString().includes(searchTerm) ||
        delivery.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    setFilteredDeliveries(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      IN_TRANSIT: 'info',
      DELIVERED: 'success',
      FAILED: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Schedule />,
      IN_TRANSIT: <LocalShipping />,
      DELIVERED: <CheckCircle />,
      FAILED: <Cancel />
    };
    return icons[status] || <Schedule />;
  };

  const calculateProgress = (status) => {
    const progressMap = {
      PENDING: 25,
      IN_TRANSIT: 75,
      DELIVERED: 100,
      FAILED: 0
    };
    return progressMap[status] || 0;
  };

  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#004c91' }}>
          Delivery Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ color: '#4caf50' }} />
          <Typography variant="body2" color="text.secondary">
            Live tracking enabled
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                {deliveryStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Deliveries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {deliveryStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                {deliveryStats.in_transit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Transit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {deliveryStats.delivered}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {deliveryStats.avgDeliveryTime}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Delivery Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Delivery Trends (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="deliveries" stroke="#004c91" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
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
              label="Search Deliveries"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, driver, or customer"
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
                <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
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
                startIcon={<LocalShipping />}
                sx={{ backgroundColor: '#004c91' }}
              >
                Track All Live
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Deliveries Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Delivery ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ETA</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id} hover>
                  <TableCell>#{delivery.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {delivery.customer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {delivery.delivery_address}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar />
                      {delivery.driver_name}
                    </Box>
                  </TableCell>
                  <TableCell>{delivery.vehicle_plate}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(delivery.status)}
                      label={delivery.status.replace('_', ' ')}
                      color={getStatusColor(delivery.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={calculateProgress(delivery.status)}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {calculateProgress(delivery.status)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timer />
                      {delivery.estimated_delivery || 'TBD'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDelivery(delivery)}
                    >
                      Track
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delivery Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedDelivery && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn sx={{ color: '#004c91' }} />
                Delivery Tracking - #{selectedDelivery.id}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Customer Information
                  </Typography>
                  <Typography><strong>Name:</strong> {selectedDelivery.customer_name}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDelivery.customer_phone}</Typography>
                  <Typography><strong>Address:</strong> {selectedDelivery.delivery_address}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Driver & Vehicle
                  </Typography>
                  <Typography><strong>Driver:</strong> {selectedDelivery.driver_name}</Typography>
                  <Typography><strong>Phone:</strong> {selectedDelivery.driver_phone}</Typography>
                  <Typography><strong>Vehicle:</strong> {selectedDelivery.vehicle_plate}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Delivery Status
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(selectedDelivery.status)}
                      label={selectedDelivery.status.replace('_', ' ')}
                      color={getStatusColor(selectedDelivery.status)}
                      size="large"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(selectedDelivery.status)}
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Progress: {calculateProgress(selectedDelivery.status)}% complete
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Live Location
                  </Typography>
                  <Box sx={{
                    p: 3,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <LocationOn sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                    <Typography variant="body1">
                      GPS Coordinates: {selectedDelivery.current_lat}, {selectedDelivery.current_lng}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {formatDate(selectedDelivery.updated_at)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Phone />}
                sx={{ backgroundColor: '#4caf50' }}
              >
                Call Driver
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Deliveries; 