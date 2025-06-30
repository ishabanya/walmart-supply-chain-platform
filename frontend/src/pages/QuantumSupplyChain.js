import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Slider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Psychology,
  ScatterPlot,
  Timeline,
  Science,
  FlashOn,
  Link,
  PlayArrow,
  Pause,
  Settings,
  TrendingUp,
  NetworkCheck,
} from '@mui/icons-material';
import {
  ScatterChart,
  Scatter as RechartsScatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const QuantumSupplyChain = () => {
  const [loading, setLoading] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [quantumState, setQuantumState] = useState('superposition');
  const [selectedItem] = useState(null);
  const [collapseAnimation, setCollapseAnimation] = useState(false);
  const [probabilityThreshold, setProbabilityThreshold] = useState(0.7);
  const [entanglementStrength, setEntanglementStrength] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);

  // Quantum inventory states
  const [inventoryStates, setInventoryStates] = useState([]);
  const [probabilityClouds, setProbabilityClouds] = useState([]);
  const [entangledOrders, setEntangledOrders] = useState([]);
  const [waveFunction, setWaveFunction] = useState([]);
  const [quantumMetrics, setQuantumMetrics] = useState({
    coherenceLevel: 94.7,
    entanglementDensity: 0.73,
    superpositionEfficiency: 89.2,
    waveCollapseSpeed: 1.3,
    quantumAdvantage: 23.4
  });

  // Initialize quantum simulation
  useEffect(() => {
    initializeQuantumSystem();
    const interval = setInterval(() => {
      if (realTimeMode) {
        updateQuantumStates();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [realTimeMode, updateQuantumStates]);

  const initializeQuantumSystem = async () => {
    setLoading(true);
    
    // Generate quantum inventory states
    const items = [
      { id: 'QI001', name: 'Gaming Console', category: 'Electronics', totalUnits: 150 },
      { id: 'QI002', name: 'Wireless Headphones', category: 'Electronics', totalUnits: 300 },
      { id: 'QI003', name: 'Smart TV', category: 'Electronics', totalUnits: 85 },
      { id: 'QI004', name: 'Laptop', category: 'Electronics', totalUnits: 120 },
      { id: 'QI005', name: 'Smartphone', category: 'Electronics', totalUnits: 200 },
    ];

    const locations = ['NYC Warehouse', 'LA Warehouse', 'Chicago Hub', 'Dallas Center', 'Miami Depot'];
    
    // Create superposition states for each item
    const superpositionStates = items.map(item => {
      const states = locations.map(location => {
        const probability = Math.random() * 0.8 + 0.1; // 0.1 to 0.9
        const amplitude = Math.sqrt(probability);
        return {
          location,
          probability,
          amplitude,
          phase: Math.random() * 2 * Math.PI,
          units: Math.floor(item.totalUnits * probability)
        };
      });
      
      // Normalize probabilities
      const totalProb = states.reduce((sum, state) => sum + state.probability, 0);
      states.forEach(state => state.probability /= totalProb);
      
      return {
        ...item,
        states,
        coherenceTime: Math.random() * 10 + 5, // 5-15 seconds
        lastMeasurement: Date.now(),
        quantumNumber: Math.floor(Math.random() * 1000) + 1000
      };
    });

    // Generate probability clouds
    const clouds = generateProbabilityClouds(superpositionStates);
    
    // Generate entangled order pairs
    const entangled = generateEntangledOrders();
    
    // Generate wave function data
    const waves = generateWaveFunction();

    setInventoryStates(superpositionStates);
    setProbabilityClouds(clouds);
    setEntangledOrders(entangled);
    setWaveFunction(waves);
    setLoading(false);
  };

  const generateProbabilityClouds = (states) => {
    const clouds = [];
    states.forEach(item => {
      item.states.forEach((state, index) => {
        clouds.push({
          x: index * 100 + Math.random() * 80,
          y: state.probability * 100 + Math.random() * 20,
          z: Math.random() * 50 + 25,
          item: item.name,
          location: state.location,
          probability: state.probability,
          intensity: state.probability * 100,
          radius: state.amplitude * 30 + 10
        });
      });
    });
    return clouds;
  };

  const generateEntangledOrders = () => {
    const orders = [
      { id: 'EO001', items: ['Gaming Console', 'Wireless Headphones'], strength: 0.89, type: 'gaming-bundle' },
      { id: 'EO002', items: ['Smart TV', 'Laptop'], strength: 0.76, type: 'home-office' },
      { id: 'EO003', items: ['Smartphone', 'Wireless Headphones'], strength: 0.82, type: 'mobile-combo' },
      { id: 'EO004', items: ['Gaming Console', 'Smart TV'], strength: 0.71, type: 'entertainment' },
    ];
    return orders.map(order => ({
      ...order,
      quantumCorrelation: order.strength,
      bellState: order.strength > 0.8 ? 'maximal' : 'partial',
      decoherenceTime: (1 - order.strength) * 10 + 2
    }));
  };

  const generateWaveFunction = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const x = i / 10;
      const amplitude = Math.exp(-Math.pow(x - 5, 2) / 8) * Math.cos(2 * Math.PI * x / 3);
      const probability = Math.pow(amplitude, 2);
      points.push({
        x: x,
        amplitude: amplitude,
        probability: probability,
        phase: Math.atan2(Math.sin(2 * Math.PI * x / 3), Math.cos(2 * Math.PI * x / 3))
      });
    }
    return points;
  };

  const updateQuantumStates = useCallback(() => {
    if (!simulationRunning) return;

    setInventoryStates(prevStates => 
      prevStates.map(item => {
        const timeSinceLastMeasurement = (Date.now() - item.lastMeasurement) / 1000;
        const decoherence = Math.min(timeSinceLastMeasurement / item.coherenceTime, 1);
        
        return {
          ...item,
          states: item.states.map(state => ({
            ...state,
            phase: state.phase + Math.random() * 0.2 - 0.1,
            probability: state.probability * (1 - decoherence * 0.1) + Math.random() * 0.05
          })),
          coherenceLevel: Math.max(0, 100 - decoherence * 20)
        };
      })
    );

    // Update quantum metrics
    setQuantumMetrics(prev => ({
      ...prev,
      coherenceLevel: Math.max(0, prev.coherenceLevel + (Math.random() - 0.5) * 2),
      entanglementDensity: Math.min(1, Math.max(0, prev.entanglementDensity + (Math.random() - 0.5) * 0.05)),
      superpositionEfficiency: Math.max(0, prev.superpositionEfficiency + (Math.random() - 0.5) * 3),
    }));
  }, [simulationRunning]);

  const handleWaveFunctionCollapse = async (itemId) => {
    setCollapseAnimation(true);
    setQuantumState('collapse');

    // Find the item and collapse its wave function
    const item = inventoryStates.find(inv => inv.id === itemId);
    if (!item) return;

    // Simulate collapse - pick the highest probability state
    const optimalState = item.states.reduce((max, state) => 
      state.probability > max.probability ? state : max
    );

    // Update metrics to show the collapse effect
    setQuantumMetrics(prev => ({
      ...prev,
      waveCollapseSpeed: prev.waveCollapseSpeed + 0.2,
      quantumAdvantage: prev.quantumAdvantage + Math.random() * 5
    }));

    setTimeout(() => {
      setCollapseAnimation(false);
      setQuantumState('measured');
      
      // Show collapse result
      alert(`Wave Function Collapsed!\n\nItem: ${item.name}\nOptimal Location: ${optimalState.location}\nProbability: ${(optimalState.probability * 100).toFixed(1)}%\nUnits Allocated: ${optimalState.units}`);
      
      setTimeout(() => {
        setQuantumState('superposition');
      }, 3000);
    }, 2000);
  };

  const getQuantumStateColor = (state) => {
    switch (state) {
      case 'superposition': return '#2196f3';
      case 'collapse': return '#ff9800';
      case 'measured': return '#4caf50';
      default: return '#757575';
    }
  };

  const getEntanglementColor = (strength) => {
    if (strength > 0.8) return '#e91e63';
    if (strength > 0.6) return '#ff9800';
    return '#2196f3';
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
          <CircularProgress size={60} sx={{ color: '#2196f3', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#2196f3' }}>
            Initializing Quantum Superposition...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3', display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 2, fontSize: 40 }} />
            Quantum-Inspired Supply Chain
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Superposition-Based Inventory Management System
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            label={`State: ${quantumState.toUpperCase()}`}
            sx={{ 
              backgroundColor: getQuantumStateColor(quantumState),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Button
            variant={simulationRunning ? "outlined" : "contained"}
            startIcon={simulationRunning ? <Pause /> : <PlayArrow />}
            onClick={() => setSimulationRunning(!simulationRunning)}
            sx={{ backgroundColor: simulationRunning ? 'transparent' : '#2196f3' }}
          >
            {simulationRunning ? 'Pause' : 'Start'} Simulation
          </Button>
          <IconButton onClick={() => setShowSettings(true)}>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Quantum Metrics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Science sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {quantumMetrics.coherenceLevel.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                Quantum Coherence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Link sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {quantumMetrics.entanglementDensity.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Entanglement Density
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <ScatterPlot sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {quantumMetrics.superpositionEfficiency.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                Superposition Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <FlashOn sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {quantumMetrics.waveCollapseSpeed.toFixed(1)}ms
              </Typography>
              <Typography variant="body2">
                Collapse Speed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                +{quantumMetrics.quantumAdvantage.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                Quantum Advantage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Probability Cloud Visualization */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#2196f3', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <ScatterPlot sx={{ mr: 1 }} />
                Quantum Probability Clouds
                {collapseAnimation && (
                  <Chip label="COLLAPSING" size="small" sx={{ ml: 2, backgroundColor: '#ff9800', color: 'white' }} />
                )}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Spatial Coordinate" />
                  <YAxis dataKey="y" name="Probability Amplitude" />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(value) => `Position: ${value}`}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2">{data.item}</Typography>
                            <Typography variant="body2">Location: {data.location}</Typography>
                            <Typography variant="body2">Probability: {(data.probability * 100).toFixed(1)}%</Typography>
                            <Typography variant="body2">Amplitude: {data.intensity.toFixed(1)}</Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsScatter 
                    data={probabilityClouds}
                    fill="#2196f3"
                    fillOpacity={collapseAnimation ? 0.3 : 0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Superposition States */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#2196f3', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Science sx={{ mr: 1 }} />
                Superposition States
              </Typography>
              <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {inventoryStates.map((item) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2, border: selectedItem === item.id ? '2px solid #2196f3' : '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={`Q#${item.quantumNumber}`}
                        size="small"
                        sx={{ backgroundColor: '#e3f2fd' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Units: {item.totalUnits} | Coherence: {item.coherenceLevel?.toFixed(1)}%
                    </Typography>
                    
                    {item.states.slice(0, 3).map((state, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption">{state.location}</Typography>
                          <Typography variant="caption">{(state.probability * 100).toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={state.probability * 100}
                          sx={{ 
                            height: 4, 
                            borderRadius: 2,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: `hsl(${240 - state.probability * 120}, 70%, 50%)`
                            }
                          }}
                        />
                      </Box>
                    ))}
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<FlashOn />}
                      onClick={() => handleWaveFunctionCollapse(item.id)}
                      sx={{ mt: 1, borderColor: '#2196f3', color: '#2196f3' }}
                    >
                      Collapse Wave Function
                    </Button>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wave Function Visualization */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#2196f3', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Timeline sx={{ mr: 1 }} />
                Wave Function Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={waveFunction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    name="Amplitude ψ(x)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="#e91e63" 
                    strokeWidth={2}
                    name="Probability |ψ(x)|²"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Entangled Orders Network */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#e91e63', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <NetworkCheck sx={{ mr: 1 }} />
                Quantum Entangled Orders
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {entangledOrders.map((order) => (
                  <Paper key={order.id} sx={{ p: 2, mb: 2, backgroundColor: '#fce4ec' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {order.id} - {order.type}
                      </Typography>
                      <Chip 
                        label={order.bellState}
                        size="small"
                        sx={{ 
                          backgroundColor: getEntanglementColor(order.quantumCorrelation),
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Entangled Items: {order.items.join(' ⟷ ')}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption">
                        Correlation: {(order.quantumCorrelation * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption">
                        Decoherence: {order.decoherenceTime.toFixed(1)}s
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={order.quantumCorrelation * 100}
                      sx={{ 
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#f8bbd9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getEntanglementColor(order.quantumCorrelation)
                        }
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quantum System Parameters</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography gutterBottom>Probability Threshold</Typography>
            <Slider
              value={probabilityThreshold}
              onChange={(e, value) => setProbabilityThreshold(value)}
              min={0.1}
              max={1}
              step={0.05}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Entanglement Strength</Typography>
            <Slider
              value={entanglementStrength}
              onChange={(e, value) => setEntanglementStrength(value)}
              min={0.1}
              max={1}
              step={0.05}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                />
              }
              label="Real-time Quantum Evolution"
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>Apply Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Quantum Alert */}
      {quantumState === 'collapse' && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            zIndex: 1000,
            animation: 'pulse 1s infinite'
          }}
        >
          <Typography variant="subtitle2">Wave Function Collapse in Progress...</Typography>
        </Alert>
      )}
    </Container>
  );
};

export default QuantumSupplyChain; 