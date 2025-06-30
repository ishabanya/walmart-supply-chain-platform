import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as DeliveryIcon,
  Analytics as AnalyticsIcon,
  Business as SuppliersIcon,
  Psychology as QuantumIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const collapsedWidth = 60;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Deliveries', icon: <DeliveryIcon />, path: '/deliveries' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Suppliers', icon: <SuppliersIcon />, path: '/suppliers' },
  { text: 'Quantum Supply Chain', icon: <QuantumIcon />, path: '/quantum' },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
          backgroundColor: '#004c91', // Walmart blue
          color: 'white',
          top: 64, // Account for navbar height
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {open && (
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Supply Chain
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: '#ffc220', // Walmart yellow
                  color: '#004c91',
                  '&:hover': {
                    backgroundColor: '#ffdd4c',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? '#004c91' : 'white',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open ? 1 : 0,
                  color: location.pathname === item.path ? '#004c91' : 'white',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 