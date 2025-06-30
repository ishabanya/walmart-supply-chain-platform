import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Analytics from './pages/Analytics';
import Suppliers from './pages/Suppliers';
import QuantumSupplyChain from './pages/QuantumSupplyChain';
import Login from './pages/Login';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main Layout Component
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for navbar height
          ml: sidebarOpen ? '240px' : '60px',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Orders />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deliveries"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Deliveries />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suppliers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quantum"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QuantumSupplyChain />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 