import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AppBar, Toolbar, Typography } from '@mui/material';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Analytics from './pages/Analytics';
import Suppliers from './pages/Suppliers';
import QuantumSupplyChain from './pages/QuantumSupplyChain';
import BlockchainSupplyChain from './pages/BlockchainSupplyChain';

// Context
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { BlockchainProvider } from './context/BlockchainContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0071ce', // Walmart blue
      light: '#4791db',
      dark: '#004c87',
    },
    secondary: {
      main: '#ffc220', // Walmart yellow
      light: '#ffdd4c',
      dark: '#b28704',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Main App Component

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <WebSocketProvider>
          <BlockchainProvider>
            <Router>
            <div className="App">
              <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Walmart Supply Chain Platform
                  </Typography>
                </Toolbar>
              </AppBar>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/deliveries" element={<Deliveries />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/quantum" element={<QuantumSupplyChain />} />
                    <Route path="/blockchain" element={<BlockchainSupplyChain />} />
                  </Routes>
                </Box>
              </Box>
            </div>
          </Router>
            </BlockchainProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 