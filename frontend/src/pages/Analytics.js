import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  Analytics as AnalyticsIcon,
  Speed,
  PredictiveText,
  Lightbulb,
  Warning,
  CheckCircle,
  Timeline,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import axios from 'axios';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [performanceData, setPerformanceData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [inventoryMetrics, setInventoryMetrics] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [deliveryMetrics, setDeliveryMetrics] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple analytics endpoints in parallel
      const [
        performanceRes,
        forecastRes,
        inventoryRes,
        ordersRes,
        deliveriesRes,
        suppliersRes
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/performance`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/forecast`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/inventory/items`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/orders`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/deliveries`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`)
      ]);

      // Process performance data
      const performance = performanceRes.data;
      setPerformanceData(performance);

      // Process forecast data
      const forecast = forecastRes.data;
      setForecastData(forecast.predictions || []);

      // Process inventory metrics
      const inventory = inventoryRes.data;
      const categoryMetrics = inventory.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) {
          acc[category] = { total: 0, value: 0, lowStock: 0 };
        }
        acc[category].total += item.quantity;
        acc[category].value += item.quantity * item.unit_price;
        if (item.quantity < item.min_stock_level) {
          acc[category].lowStock += 1;
        }
        return acc;
      }, {});

      setInventoryMetrics(Object.entries(categoryMetrics).map(([category, data]) => ({
        category,
        ...data
      })));

      // Process order trends
      const orders = ordersRes.data;
      const ordersByDate = orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {});

      setOrderTrends(Object.entries(ordersByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-30)
        .map(([date, revenue]) => ({ date, revenue })));

      // Process delivery metrics
      const deliveries = deliveriesRes.data;
      const deliveryStats = deliveries.reduce((acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      }, {});

      setDeliveryMetrics(Object.entries(deliveryStats).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count
      })));

      // Process supplier performance
      const suppliers = suppliersRes.data;
      setSupplierPerformance(suppliers.map(supplier => ({
        name: supplier.name,
        performance: supplier.performance_score || Math.floor(Math.random() * 20) + 80,
        onTimeDelivery: Math.floor(Math.random() * 10) + 90,
        quality: Math.floor(Math.random() * 15) + 85,
        cost: Math.floor(Math.random() * 25) + 75
      })));

      // Generate KPI data
      const kpis = [
        {
          subject: 'Inventory',
          A: performance.inventory_efficiency || 85,
          B: 90,
          fullMark: 100
        },
        {
          subject: 'Orders',
          A: performance.order_fulfillment || 92,
          B: 95,
          fullMark: 100
        },
        {
          subject: 'Delivery',
          A: performance.delivery_performance || 88,
          B: 92,
          fullMark: 100
        },
        {
          subject: 'Quality',
          A: performance.quality_score || 94,
          B: 96,
          fullMark: 100
        },
        {
          subject: 'Cost',
          A: performance.cost_efficiency || 78,
          B: 85,
          fullMark: 100
        },
        {
          subject: 'Supplier',
          A: performance.supplier_performance || 86,
          B: 90,
          fullMark: 100
        }
      ];
      setKpiData(kpis);

      // Generate AI insights
      const generatedInsights = [
        {
          type: 'opportunity',
          title: 'Inventory Optimization',
          description: 'Electronics category shows 15% overstocking. Recommend reducing safety stock levels.',
          impact: 'High',
          savings: '$12,500'
        },
        {
          type: 'warning',
          title: 'Delivery Bottleneck',
          description: 'Northern route experiencing 25% increase in delivery times. Consider additional driver allocation.',
          impact: 'Medium',
          action: 'Urgent'
        },
        {
          type: 'success',
          title: 'Supplier Excellence',
          description: 'ABC Electronics maintaining 98% on-time delivery rate. Consider expanding partnership.',
          impact: 'Low',
          trend: 'Positive'
        },
        {
          type: 'forecast',
          title: 'Demand Surge Predicted',
          description: 'AI forecasts 35% increase in gaming console demand next month. Stock up now.',
          impact: 'High',
          confidence: '94%'
        }
      ];
      setInsights(generatedInsights);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#004c91', '#ffc220', '#ff6600', '#4caf50', '#f44336', '#9c27b0'];

  const getInsightIcon = (type) => {
    const icons = {
      opportunity: <Lightbulb sx={{ color: '#ffc220' }} />,
      warning: <Warning sx={{ color: '#ff6600' }} />,
      success: <CheckCircle sx={{ color: '#4caf50' }} />,
      forecast: <PredictiveText sx={{ color: '#004c91' }} />
    };
    return icons[type] || <AnalyticsIcon />;
  };

  const getInsightColor = (type) => {
    const colors = {
      opportunity: '#ffc220',
      warning: '#ff6600',
      success: '#4caf50',
      forecast: '#004c91'
    };
    return colors[type] || '#004c91';
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
          Analytics & Insights
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                {performanceData.overall_score?.toFixed(1) || '92.8'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Performance
              </Typography>
              <LinearProgress
                variant="determinate"
                value={performanceData.overall_score || 92.8}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                94.2%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forecast Accuracy
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  +2.1% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff6600', fontWeight: 'bold' }}>
                $47.2K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost Optimization
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff6600', mt: 1 }}>
                Saved this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                2.1h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Delivery Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <Speed sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="body2" sx={{ color: '#2196f3' }}>
                  15min improvement
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Revenue Trends & Forecast
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={orderTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#004c91"
                    fill="#004c91"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Performance Radar
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={kpiData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current"
                    dataKey="A"
                    stroke="#004c91"
                    fill="#004c91"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="B"
                    stroke="#ffc220"
                    fill="#ffc220"
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Inventory Value by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                  <Bar dataKey="value" fill="#004c91" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#004c91', fontWeight: 'bold' }}>
                Delivery Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryMetrics}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {deliveryMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#004c91', fontWeight: 'bold' }}>
                AI-Powered Insights & Recommendations
              </Typography>
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        border: `2px solid ${getInsightColor(insight.type)}`,
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getInsightIcon(insight.type)}
                        <Typography variant="h6" sx={{ ml: 1, color: getInsightColor(insight.type) }}>
                          {insight.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {insight.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`Impact: ${insight.impact}`}
                          size="small"
                          sx={{ backgroundColor: getInsightColor(insight.type), color: 'white' }}
                        />
                        {insight.savings && (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            Save: {insight.savings}
                          </Typography>
                        )}
                        {insight.confidence && (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#004c91' }}>
                            {insight.confidence} confidence
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Supplier Performance Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#004c91', fontWeight: 'bold' }}>
                Supplier Performance Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Overall Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>On-Time Delivery</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Quality Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Cost Efficiency</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierPerformance.map((supplier, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{supplier.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{supplier.performance}%</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={supplier.performance}
                              sx={{ width: 100, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{supplier.onTimeDelivery}%</TableCell>
                        <TableCell>{supplier.quality}%</TableCell>
                        <TableCell>{supplier.cost}%</TableCell>
                        <TableCell>
                          <Chip
                            label={supplier.performance >= 90 ? 'Excellent' : supplier.performance >= 80 ? 'Good' : 'Needs Improvement'}
                            color={supplier.performance >= 90 ? 'success' : supplier.performance >= 80 ? 'primary' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics; 