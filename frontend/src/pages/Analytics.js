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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  Analytics as AnalyticsIcon,
  Speed,
  Lightbulb,
  Warning,
  CheckCircle,
  Timeline,
  ExpandMore,
  Refresh,
  AutoFixHigh,
  TrendingDown,
  Assessment,
  PsychologyAlt
} from '@mui/icons-material';
import {
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
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import axios from 'axios';
import RealTimeTracker from '../components/RealTimeTracker';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState(0);
  const [performanceData, setPerformanceData] = useState({});
  const [inventoryMetrics, setInventoryMetrics] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [deliveryMetrics, setDeliveryMetrics] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Generate comprehensive sample data
      const sampleInventoryMetrics = [
        { category: 'Electronics', total: 1250, value: 125000, lowStock: 5, turnoverRate: 8.5 },
        { category: 'Clothing', total: 2100, value: 85000, lowStock: 12, turnoverRate: 12.3 },
        { category: 'Home & Garden', total: 950, value: 67500, lowStock: 3, turnoverRate: 6.7 },
        { category: 'Sports', total: 750, value: 45000, lowStock: 8, turnoverRate: 9.2 },
        { category: 'Health & Beauty', total: 1100, value: 78000, lowStock: 15, turnoverRate: 14.1 }
      ];

      const sampleOrderTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        revenue: Math.floor(Math.random() * 5000) + 15000,
        orders: Math.floor(Math.random() * 100) + 150,
        avgOrderValue: Math.floor(Math.random() * 50) + 85
      }));

      const sampleDeliveryMetrics = [
        { status: 'Delivered', count: 234, percentage: 78.5 },
        { status: 'In Transit', count: 45, percentage: 15.1 },
        { status: 'Delayed', count: 12, percentage: 4.0 },
        { status: 'Failed', count: 7, percentage: 2.4 }
      ];

      const sampleSupplierPerformance = [
        { name: 'TechCorp Solutions', performance: 94, onTimeDelivery: 96, quality: 92, cost: 88 },
        { name: 'Fashion Forward Inc', performance: 89, onTimeDelivery: 87, quality: 93, cost: 85 },
        { name: 'Garden Masters', performance: 92, onTimeDelivery: 94, quality: 89, cost: 91 },
        { name: 'SportsPro Ltd', performance: 87, onTimeDelivery: 85, quality: 88, cost: 89 },
        { name: 'Beauty Basics Co', performance: 91, onTimeDelivery: 93, quality: 90, cost: 87 }
      ];

      // Set the data
      setInventoryMetrics(sampleInventoryMetrics);
      setOrderTrends(sampleOrderTrends);
      setDeliveryMetrics(sampleDeliveryMetrics);
      setSupplierPerformance(sampleSupplierPerformance);

      // Generate KPI data
      const kpis = [
        { subject: 'Inventory', A: 85, B: 90, fullMark: 100 },
        { subject: 'Orders', A: 92, B: 95, fullMark: 100 },
        { subject: 'Delivery', A: 88, B: 92, fullMark: 100 },
        { subject: 'Quality', A: 94, B: 96, fullMark: 100 },
        { subject: 'Cost', A: 78, B: 85, fullMark: 100 },
        { subject: 'Supplier', A: 86, B: 90, fullMark: 100 }
      ];
      setKpiData(kpis);

      // Generate enhanced AI insights
      const aiInsights = [
        {
          id: 1,
          type: 'opportunity',
          title: 'Inventory Optimization Opportunity',
          description: 'Electronics category shows 15% overstocking. Recommend reducing safety stock levels by 20% to free up $12,500 in working capital.',
          impact: 'High',
          savings: '$12,500',
          timeframe: '30 days',
          confidence: 92,
          priority: 'High',
          category: 'Cost Optimization'
        },
        {
          id: 2,
          type: 'warning',
          title: 'Demand Spike Predicted',
          description: 'Machine learning models predict 40% increase in Home & Garden demand over next 2 weeks based on seasonal patterns and weather forecasts.',
          impact: 'Medium',
          action: 'Increase stock levels by 35%',
          timeframe: '14 days',
          confidence: 85,
          priority: 'High',
          category: 'Demand Forecasting'
        },
        {
          id: 3,
          type: 'success',
          title: 'Route Optimization Success',
          description: 'AI-powered delivery route optimization has improved efficiency by 23%, reducing fuel costs and delivery times.',
          impact: 'High',
          savings: '$8,750',
          timeframe: 'Current',
          confidence: 98,
          priority: 'Low',
          category: 'Operational Excellence'
        },
        {
          id: 4,
          type: 'recommendation',
          title: 'Supplier Diversification Required',
          description: 'Risk analysis indicates over-reliance on single supplier for 65% of Grocery category inventory.',
          impact: 'Medium',
          action: 'Add 2-3 backup suppliers',
          timeframe: '60 days',
          confidence: 78,
          priority: 'Medium',
          category: 'Risk Management'
        },
        {
          id: 5,
          type: 'alert',
          title: 'Quality Score Decline Detected',
          description: 'TechCorp Solutions quality scores dropped 12% this month. Anomaly detection suggests potential process issues.',
          impact: 'High',
          action: 'Schedule supplier audit',
          timeframe: '7 days',
          confidence: 95,
          priority: 'Critical',
          category: 'Quality Control'
        }
      ];
      setInsights(aiInsights);

      // Generate predictions
      const predictionData = [
        {
          metric: 'Revenue',
          current: 145000,
          predicted: 162000,
          change: 11.7,
          confidence: 89
        },
        {
          metric: 'Inventory Turnover',
          current: 8.5,
          predicted: 9.2,
          change: 8.2,
          confidence: 84
        },
        {
          metric: 'Customer Satisfaction',
          current: 4.2,
          predicted: 4.5,
          change: 7.1,
          confidence: 92
        }
      ];
      setPredictions(predictionData);

      // Generate anomaly detection results
      const anomalyData = [
        {
          type: 'Inventory',
          description: 'Unusual stock depletion in Electronics warehouse 2',
          severity: 'Medium',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'Orders',
          description: 'Order cancellation rate 3x higher than normal',
          severity: 'High',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];
      setAnomalies(anomalyData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    const icons = {
      opportunity: <Lightbulb sx={{ color: '#ffc220' }} />,
      warning: <Warning sx={{ color: '#ff6600' }} />,
      success: <CheckCircle sx={{ color: '#4caf50' }} />,
      recommendation: <AutoFixHigh sx={{ color: '#2196f3' }} />,
      alert: <Warning sx={{ color: '#f44336' }} />
    };
    return icons[type] || <AnalyticsIcon />;
  };

  const getInsightColor = (type) => {
    const colors = {
      opportunity: '#ffc220',
      warning: '#ff6600',
      success: '#4caf50',
      recommendation: '#2196f3',
      alert: '#f44336'
    };
    return colors[type] || '#004c91';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: 'error',
      High: 'warning',
      Medium: 'info',
      Low: 'success'
    };
    return colors[priority] || 'default';
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#004c91' }}>
          Advanced Analytics & AI Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Real-Time Tracker */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <RealTimeTracker />
        </Grid>
      </Grid>

      {/* Enhanced KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#004c91', fontWeight: 'bold' }}>
                94.2%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI Forecast Accuracy
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
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {insights.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active AI Insights
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff6600', mt: 1 }}>
                {insights.filter(i => i.priority === 'Critical' || i.priority === 'High').length} High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ffc220', fontWeight: 'bold' }}>
                $41.4K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Potential Savings Identified
              </Typography>
              <Typography variant="body2" sx={{ color: '#4caf50', mt: 1 }}>
                From AI recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={anomalies.length} color="error">
                <Assessment sx={{ fontSize: 40, color: '#004c91' }} />
              </Badge>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Anomalies Detected
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336', mt: 1 }}>
                {anomalies.filter(a => a.severity === 'High').length} Critical
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Analytics Content */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<PsychologyAlt />} label="AI Insights" />
          <Tab icon={<TrendingUp />} label="Performance" />
          <Tab icon={<Timeline />} label="Predictions" />
          <Tab icon={<Warning />} label="Anomalies" />
        </Tabs>

        {/* AI Insights Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              AI-Powered Business Insights
            </Typography>
            <Grid container spacing={3}>
              {insights.map((insight) => (
                <Grid item xs={12} md={6} key={insight.id}>
                  <Card sx={{ height: '100%', border: `2px solid ${getInsightColor(insight.type)}20` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getInsightIcon(insight.type)}
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {insight.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={insight.priority}
                          color={getPriorityColor(insight.priority)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {insight.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={insight.category} size="small" variant="outlined" />
                        <Chip label={`${insight.confidence}% confidence`} size="small" />
                        {insight.savings && (
                          <Chip label={`Saves ${insight.savings}`} size="small" color="success" />
                        )}
                        {insight.timeframe && (
                          <Chip label={insight.timeframe} size="small" />
                        )}
                      </Box>
                      
                      {insight.action && (
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          color: getInsightColor(insight.type),
                          mt: 1
                        }}>
                          Action: {insight.action}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Revenue Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={orderTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#004c91" fillOpacity={0.3} stroke="#004c91" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ffc220" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Performance Radar
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={kpiData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar name="Current" dataKey="A" stroke="#004c91" fill="#004c91" fillOpacity={0.6} />
                      <Radar name="Target" dataKey="B" stroke="#ffc220" fill="#ffc220" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Supplier Performance Matrix
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Supplier</strong></TableCell>
                          <TableCell><strong>Overall Score</strong></TableCell>
                          <TableCell><strong>On-Time Delivery</strong></TableCell>
                          <TableCell><strong>Quality</strong></TableCell>
                          <TableCell><strong>Cost Efficiency</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {supplierPerformance.map((supplier) => (
                          <TableRow key={supplier.name}>
                            <TableCell>{supplier.name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={supplier.performance}
                                  sx={{ width: 100, mr: 2 }}
                                />
                                {supplier.performance}%
                              </Box>
                            </TableCell>
                            <TableCell>{supplier.onTimeDelivery}%</TableCell>
                            <TableCell>{supplier.quality}%</TableCell>
                            <TableCell>{supplier.cost}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Predictions Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              AI-Powered Predictions
            </Typography>
            <Grid container spacing={3}>
              {predictions.map((prediction) => (
                <Grid item xs={12} md={4} key={prediction.metric}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {prediction.metric}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Current</Typography>
                          <Typography variant="h5">{prediction.current.toLocaleString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Predicted</Typography>
                          <Typography variant="h5" sx={{ color: '#4caf50' }}>
                            {prediction.predicted.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          icon={<TrendingUp />}
                          label={`+${prediction.change}%`}
                          color="success"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {prediction.confidence}% confidence
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Anomalies Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Anomaly Detection Results
            </Typography>
            <Grid container spacing={3}>
              {anomalies.map((anomaly, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ border: anomaly.severity === 'High' ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Warning sx={{ color: anomaly.severity === 'High' ? '#f44336' : '#ff9800' }} />
                          <Box>
                            <Typography variant="h6">{anomaly.type} Anomaly</Typography>
                            <Typography variant="body2">{anomaly.description}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={anomaly.severity}
                            color={anomaly.severity === 'High' ? 'error' : 'warning'}
                          />
                          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            {anomaly.timestamp.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Analytics; 