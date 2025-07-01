import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import {
  Timeline,
  Inventory,
  LocalShipping,
  ShoppingCart,
  ExpandMore,
  ExpandLess,
  Refresh,
  FiberManualRecord
} from '@mui/icons-material';

const RealTimeTracker = ({ type = 'all' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [stats, setStats] = useState({
    inventory: { active: 0, alerts: 0 },
    orders: { processing: 0, shipped: 0 },
    deliveries: { inTransit: 0, delayed: 0 }
  });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      wsRef.current = new WebSocket(`${wsUrl}/ws/${clientId}`);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send subscription message
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          channels: type === 'all' ? ['inventory', 'orders', 'deliveries'] : [type]
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
      
      // Simulate real-time updates for demo purposes
      startDemoUpdates();
    }
  };

  // Demo mode when WebSocket is not available
  const startDemoUpdates = () => {
    const interval = setInterval(() => {
      const demoUpdates = [
        {
          type: 'inventory',
          message: 'Stock level updated for Organic Bananas',
          level: 'info',
          timestamp: new Date().toISOString(),
          data: { item: 'Organic Bananas', old_stock: 45, new_stock: 42 }
        },
        {
          type: 'orders',
          message: 'New order received from John Smith',
          level: 'success',
          timestamp: new Date().toISOString(),
          data: { order_id: 'ORD-' + Math.floor(Math.random() * 10000), customer: 'John Smith' }
        },
        {
          type: 'deliveries',
          message: 'Delivery DEL-1234 is now in transit',
          level: 'info',
          timestamp: new Date().toISOString(),
          data: { delivery_id: 'DEL-1234', status: 'IN_TRANSIT' }
        }
      ];
      
      const randomUpdate = demoUpdates[Math.floor(Math.random() * demoUpdates.length)];
      handleWebSocketMessage(randomUpdate);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  const handleWebSocketMessage = (data) => {
    // Add new update to the list
    setUpdates(prev => [
      {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      },
      ...prev.slice(0, 49) // Keep only last 50 updates
    ]);

    // Update stats based on message type
    setStats(prev => {
      const newStats = { ...prev };
      
      switch (data.type) {
        case 'inventory':
          if (data.level === 'warning' || data.level === 'error') {
            newStats.inventory.alerts = prev.inventory.alerts + 1;
          }
          newStats.inventory.active = prev.inventory.active + 1;
          break;
        case 'orders':
          if (data.message.includes('processing')) {
            newStats.orders.processing = prev.orders.processing + 1;
          } else if (data.message.includes('shipped')) {
            newStats.orders.shipped = prev.orders.shipped + 1;
          }
          break;
        case 'deliveries':
          if (data.message.includes('in transit')) {
            newStats.deliveries.inTransit = prev.deliveries.inTransit + 1;
          } else if (data.message.includes('delayed')) {
            newStats.deliveries.delayed = prev.deliveries.delayed + 1;
          }
          break;
      }
      
      return newStats;
    });
  };

  const getUpdateIcon = (type) => {
    const icons = {
      inventory: <Inventory />,
      orders: <ShoppingCart />,
      deliveries: <LocalShipping />
    };
    return icons[type] || <Timeline />;
  };

  const getUpdateColor = (level) => {
    const colors = {
      success: 'success',
      info: 'info',
      warning: 'warning',
      error: 'error'
    };
    return colors[level] || 'default';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRefresh = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'refresh',
        timestamp: new Date().toISOString()
      }));
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline sx={{ color: '#004c91' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Real-Time Tracker
            </Typography>
            <Badge
              color={isConnected ? 'success' : 'error'}
              variant="dot"
              sx={{
                '& .MuiBadge-dot': {
                  animation: isConnected ? 'pulse 2s infinite' : 'none'
                }
              }}
            >
              <FiberManualRecord 
                sx={{ 
                  fontSize: 12, 
                  color: isConnected ? '#4caf50' : '#f44336',
                  ml: 1
                }} 
              />
            </Badge>
          </Box>
          <Box>
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {!isConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Running in demo mode - WebSocket connection not available
          </Alert>
        )}

        {/* Stats Overview */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Inventory />}
            label={`Inventory: ${stats.inventory.active} active, ${stats.inventory.alerts} alerts`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<ShoppingCart />}
            label={`Orders: ${stats.orders.processing} processing, ${stats.orders.shipped} shipped`}
            color="secondary"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<LocalShipping />}
            label={`Deliveries: ${stats.deliveries.inTransit} in transit, ${stats.deliveries.delayed} delayed`}
            color="info"
            variant="outlined"
            size="small"
          />
        </Box>

        <Collapse in={expanded}>
          <Box>
            {updates.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent updates. Real-time data will appear here.
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {updates.map((update) => (
                  <ListItem key={update.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getUpdateIcon(update.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {update.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={update.type}
                              size="small"
                              color={getUpdateColor(update.level)}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(update.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={update.data && (
                        <Typography variant="caption" color="text.secondary">
                          {JSON.stringify(update.data, null, 0)}
                        </Typography>
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Collapse>
      </CardContent>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Card>
  );
};

export default RealTimeTracker; 