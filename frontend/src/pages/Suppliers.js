import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Business,
  Phone,
  Email,
  LocationOn,
  Star,
  Handshake,
  Add,
  Visibility,
  Edit,
  Person,
  LocalShipping,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [supplierStats, setSupplierStats] = useState({
    total: 0,
    active: 0,
    avgPerformance: 0,
    topPerformer: '',
    totalContracts: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [filterSuppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`);
      const suppliersData = response.data;
      setSuppliers(suppliersData);

      // Calculate stats
      const activeSuppliers = suppliersData.filter(s => s.status === 'ACTIVE');
      const avgPerformance = suppliersData.reduce((sum, s) => sum + (s.performance_score || 85), 0) / suppliersData.length;
      const topPerformer = suppliersData.reduce((top, current) => 
        (current.performance_score || 85) > (top.performance_score || 85) ? current : top
      );

      setSupplierStats({
        total: suppliersData.length,
        active: activeSuppliers.length,
        avgPerformance: avgPerformance.toFixed(1),
        topPerformer: topPerformer.name,
        totalContracts: suppliersData.reduce((sum, s) => sum + (s.contracts_count || 2), 0)
      });

      // Prepare performance data for charts
      const performanceData = suppliersData.map(supplier => ({
        name: supplier.name,
        performance: supplier.performance_score || Math.floor(Math.random() * 20) + 80,
        onTime: Math.floor(Math.random() * 10) + 90,
        quality: Math.floor(Math.random() * 15) + 85,
        cost: Math.floor(Math.random() * 25) + 75
      }));
      setPerformanceData(performanceData);

      // Category distribution
      const categoryStats = suppliersData.reduce((acc, supplier) => {
        const category = supplier.category || 'General';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setCategoryData(Object.entries(categoryStats).map(([category, count]) => ({
        category,
        count
      })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setLoading(false);
    }
  };

  const filterSuppliers = useCallback(() => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(supplier => 
        (supplier.category || 'General') === categoryFilter
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, categoryFilter, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'error',
      PENDING: 'warning',
      SUSPENDED: 'error'
    };
    return colors[status] || 'default';
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#ffc220';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };



  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        Supplier Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                {supplierStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {supplierStats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ffc220', fontWeight: 'bold' }}>
                {supplierStats.avgPerformance}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                {supplierStats.totalContracts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Contracts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Star sx={{ color: '#ffc220', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                  Top Performer
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {supplierStats.topPerformer}
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
                Supplier Performance Metrics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" fill="#004c91" name="Overall Performance" />
                  <Bar dataKey="onTime" fill="#4caf50" name="On-Time Delivery" />
                  <Bar dataKey="quality" fill="#ffc220" name="Quality Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Supplier Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff6600" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Suppliers"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or location"
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
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ backgroundColor: '#004c91' }}
              >
                Add Supplier
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Suppliers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Performance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contracts</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Order</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const performanceScore = supplier.performance_score || Math.floor(Math.random() * 20) + 80;
                return (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: '#004c91' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {supplier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {supplier.contact_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.category || 'General'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                        <LinearProgress
                          variant="determinate"
                          value={performanceScore}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getPerformanceColor(performanceScore),
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: getPerformanceColor(performanceScore) }}>
                          {performanceScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.status}
                        color={getStatusColor(supplier.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Handshake />
                        {supplier.contracts_count || 2}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(supplier.created_at)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          variant="outlined"
                        >
                          Edit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Supplier Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedSupplier && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: '#004c91' }}>
                  <Business />
                </Avatar>
                {selectedSupplier.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: '#666' }} />
                    <Typography>{selectedSupplier.contact_person}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: '#666' }} />
                    <Typography>{selectedSupplier.contact_email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: '#666' }} />
                    <Typography>{selectedSupplier.contact_phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: '#666' }} />
                    <Typography>{selectedSupplier.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                    Business Information
                  </Typography>
                  <Typography><strong>Category:</strong> {selectedSupplier.category || 'General'}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip
                      label={selectedSupplier.status}
                      color={getStatusColor(selectedSupplier.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Contracts:</strong> {selectedSupplier.contracts_count || 2}</Typography>
                  <Typography><strong>Joined:</strong> {formatDate(selectedSupplier.created_at)}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                      {selectedSupplier.performance_score || 87}%
                    </Typography>
                    <Typography variant="body2">Overall Score</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      94%
                    </Typography>
                    <Typography variant="body2">On-Time Delivery</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ color: '#ffc220', fontWeight: 'bold' }}>
                      92%
                    </Typography>
                    <Typography variant="body2">Quality Score</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ color: '#ff6600', fontWeight: 'bold' }}>
                      $2.4M
                    </Typography>
                    <Typography variant="body2">Total Orders</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91' }}>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#4caf50' }}>
                      <CheckCircle />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Order #12345 delivered successfully"
                    secondary="2 days ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#2196f3' }}>
                      <LocalShipping />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="New purchase order created"
                    secondary="1 week ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#ffc220' }}>
                      <Warning />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Quality inspection completed"
                    secondary="2 weeks ago"
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                sx={{ backgroundColor: '#004c91' }}
              >
                Edit Supplier
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ backgroundColor: '#4caf50' }}
              >
                New Contract
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Suppliers; 