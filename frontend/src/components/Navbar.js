import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Chip,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, connected, clearNotifications } = useWebSocket();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileClose();
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert':
        return 'error';
      case 'inventory':
        return 'warning';
      case 'delivery':
        return 'info';
      case 'order':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #0071ce 0%, #004c87 100%)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Walmart Supply Chain
          </Typography>
          <Chip
            label="DEMO"
            size="small"
            sx={{
              ml: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Connection Status */}
        <Tooltip title={connected ? 'Real-time connected' : 'Disconnected'}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: connected ? '#4caf50' : '#f44336',
              mr: 2,
            }}
          />
        </Tooltip>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={handleNotificationClick}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={notifications.length} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Profile */}
        <IconButton color="inherit" onClick={handleProfileClick}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Notifications</Typography>
            {notifications.length > 0 && (
              <Chip
                label={`${notifications.length} new`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          {notifications.length === 0 ? (
            <MenuItem>
              <Typography color="text.secondary">No new notifications</Typography>
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem key={notification.id} divider>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Chip
                      label={notification.type}
                      size="small"
                      color={getNotificationColor(notification.type)}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          
          {notifications.length > 0 && (
            <MenuItem onClick={() => { clearNotifications(); handleNotificationClose(); }}>
              <Typography color="primary" sx={{ textAlign: 'center', width: '100%' }}>
                Clear all notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: { width: 200 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.user_type} User
            </Typography>
          </Box>
          
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 