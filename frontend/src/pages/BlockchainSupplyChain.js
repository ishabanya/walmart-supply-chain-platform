import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Link as LinkIcon,
  Security,
  AccountBalance,
  Factory,
  LocalShipping,
  Store,
  Assignment,
  Add,
  CheckCircle,
  RadioButtonUnchecked,
  Visibility,
  ContentCopy,
} from '@mui/icons-material';

const BlockchainSupplyChain = () => {
  // Mock blockchain state for demo
  const [isConnected] = useState(true);
  const [account] = useState('0x742d35Cc6434C0532925a3b8FF1AC4B3A36C482e');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    place: '',
    address: '',
    description: ''
  });

  // Mock data
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Aspirin 500mg',
      description: 'Pain relief medication',
      stage: 'Manufacturing Stage',
      rmsId: 1,
      manufacturerId: 1,
      distributorId: 0,
      retailerId: 0
    },
    {
      id: 2,
      name: 'Vitamin D3',
      description: 'Vitamin supplement',
      stage: 'Distribution Stage',
      rmsId: 1,
      manufacturerId: 1,
      distributorId: 1,
      retailerId: 0
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      type: 'Order Medicine',
      hash: '0x1234567890abcdef',
      timestamp: new Date(),
      details: { name: 'Aspirin 500mg' }
    },
    {
      type: 'Supply Raw Material',
      hash: '0xabcdef1234567890',
      timestamp: new Date(Date.now() - 300000),
      details: { medicineId: 1 }
    }
  ]);

  // Medicine stages
  const medicineStages = [
    'Medicine Ordered',
    'Raw Material Supply Stage',
    'Manufacturing Stage',
    'Distribution Stage',
    'Retail Stage',
    'Sold'
  ];

  const getStageIndex = (stage) => {
    return medicineStages.findIndex(s => s === stage);
  };

  const getStageColor = (stage) => {
    const index = getStageIndex(stage);
    const colors = ['#9e9e9e', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#f44336'];
    return colors[index] || '#9e9e9e';
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setFormData({ name: '', place: '', address: '', description: '' });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', place: '', address: '', description: '' });
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    
    try {
      const { name, place, description } = formData;
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (dialogType === 'medicine') {
        const newMedicine = {
          id: medicines.length + 1,
          name,
          description,
          stage: 'Medicine Ordered',
          rmsId: 0,
          manufacturerId: 0,
          distributorId: 0,
          retailerId: 0
        };
        setMedicines([...medicines, newMedicine]);
        
        const newTransaction = {
          type: 'Order Medicine',
          hash: `0x${Math.random().toString(16).substr(2, 16)}`,
          timestamp: new Date(),
          details: { name, medicineId: newMedicine.id }
        };
        setTransactions([newTransaction, ...transactions]);
      } else {
        const newTransaction = {
          type: `Add ${dialogType.toUpperCase()}`,
          hash: `0x${Math.random().toString(16).substr(2, 16)}`,
          timestamp: new Date(),
          details: { name, place }
        };
        setTransactions([newTransaction, ...transactions]);
      }
      
      handleCloseDialog();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineAction = async (medicineId, action) => {
    setLoading(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedMedicines = medicines.map(med => {
        if (med.id === medicineId) {
          const currentStageIndex = getStageIndex(med.stage);
          if (currentStageIndex < medicineStages.length - 1) {
            return { ...med, stage: medicineStages[currentStageIndex + 1] };
          }
        }
        return med;
      });
      
      setMedicines(updatedMedicines);
      
      const newTransaction = {
        type: action.charAt(0).toUpperCase() + action.slice(1),
        hash: `0x${Math.random().toString(16).substr(2, 16)}`,
        timestamp: new Date(),
        details: { medicineId }
      };
      setTransactions([newTransaction, ...transactions]);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearError = () => {
    setError(null);
  };

  if (!isConnected) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Security sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Connect to Blockchain
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please connect your MetaMask wallet to access the blockchain supply chain features.
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            Make sure you have MetaMask installed and are connected to the correct network.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', display: 'flex', alignItems: 'center' }}>
            <LinkIcon sx={{ mr: 2, fontSize: 40 }} />
            Blockchain Supply Chain
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Decentralized Pharmaceutical Supply Chain Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<AccountBalance />}
            label={`Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}`}
            color="success"
            variant="outlined"
          />
          <Tooltip title="Copy Address">
            <IconButton onClick={() => copyToClipboard(account)} size="small">
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Participant Management */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
            Supply Chain Participants
          </Typography>
        </Grid>
        
        {[
          { type: 'rms', title: 'Raw Material Suppliers', icon: <Assignment />, color: '#ff9800' },
          { type: 'manufacturer', title: 'Manufacturers', icon: <Factory />, color: '#2196f3' },
          { type: 'distributor', title: 'Distributors', icon: <LocalShipping />, color: '#4caf50' },
          { type: 'retailer', title: 'Retailers', icon: <Store />, color: '#9c27b0' }
        ].map((participant) => (
          <Grid item xs={12} md={3} key={participant.type}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: participant.color, mb: 2 }}>
                  {participant.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {participant.title}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog(participant.type)}
                  sx={{ borderColor: participant.color, color: participant.color }}
                >
                  Add {participant.title.slice(0, -1)}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Medicine Management */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Medicine Tracking
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('medicine')}
                >
                  Order Medicine
                </Button>
              </Box>
              
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {medicines.map((medicine) => (
                  <Paper key={medicine.id} sx={{ p: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {medicine.name}
                      </Typography>
                      <Chip 
                        label={medicine.stage}
                        sx={{ 
                          backgroundColor: getStageColor(medicine.stage),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {medicine.description}
                    </Typography>
                    
                    {/* Stage Progress */}
                    <Stepper activeStep={getStageIndex(medicine.stage)} sx={{ mb: 2 }}>
                      {medicineStages.map((stage, index) => (
                        <Step key={stage}>
                          <StepLabel>{stage}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {medicine.stage === 'Medicine Ordered' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineAction(medicine.id, 'supply')}
                        >
                          Supply Raw Material
                        </Button>
                      )}
                      {medicine.stage === 'Raw Material Supply Stage' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineAction(medicine.id, 'manufacture')}
                        >
                          Manufacture
                        </Button>
                      )}
                      {medicine.stage === 'Manufacturing Stage' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineAction(medicine.id, 'distribute')}
                        >
                          Distribute
                        </Button>
                      )}
                      {medicine.stage === 'Distribution Stage' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineAction(medicine.id, 'retail')}
                        >
                          Retail
                        </Button>
                      )}
                      {medicine.stage === 'Retail Stage' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineAction(medicine.id, 'sell')}
                        >
                          Sell
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Visibility />}
                        onClick={() => setSelectedMedicine(medicine)}
                      >
                        Details
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Recent Transactions
              </Typography>
              
              <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {transactions.map((tx, index) => (
                  <Box key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={tx.type}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {tx.timestamp.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: '#1976d2' }}>
                              {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < transactions.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Participant/Medicine Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'medicine' ? 'Order New Medicine' : `Add ${dialogType?.toUpperCase()}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            {dialogType !== 'medicine' && (
              <>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Place"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            
            {dialogType === 'medicine' && (
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={loading}>
            {dialogType === 'medicine' ? 'Order' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medicine Details Dialog */}
      <Dialog 
        open={!!selectedMedicine} 
        onClose={() => setSelectedMedicine(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Medicine Details</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedMedicine.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedMedicine.description}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Supply Chain Journey:
              </Typography>
              
              <Stepper orientation="vertical" activeStep={getStageIndex(selectedMedicine.stage)}>
                {medicineStages.map((stage, index) => (
                  <Step key={stage}>
                    <StepLabel
                      icon={
                        index <= getStageIndex(selectedMedicine.stage) ? 
                        <CheckCircle sx={{ color: '#4caf50' }} /> : 
                        <RadioButtonUnchecked />
                      }
                    >
                      <Typography variant="body1">{stage}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {index <= getStageIndex(selectedMedicine.stage) ? 'Completed' : 'Pending'}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMedicine(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlockchainSupplyChain; 