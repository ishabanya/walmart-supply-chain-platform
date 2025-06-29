import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('ws://localhost:8000/ws/admin-dashboard', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('🔗 WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setConnected(false);
    });

    // Listen for real-time updates
    newSocket.on('inventory_update', (data) => {
      console.log('📦 Inventory update:', data);
      addNotification({
        type: 'inventory',
        title: 'Inventory Update',
        message: `${data.data?.low_stock_items?.length || 0} items need attention`,
        timestamp: new Date(),
      });
    });

    newSocket.on('delivery_update', (data) => {
      console.log('🚚 Delivery update:', data);
      addNotification({
        type: 'delivery',
        title: 'Delivery Update',
        message: `${data.data?.active_deliveries?.length || 0} active deliveries`,
        timestamp: new Date(),
      });
    });

    newSocket.on('order_update', (data) => {
      console.log('📋 Order update:', data);
      addNotification({
        type: 'order',
        title: 'Order Update',
        message: `${data.data?.pending_orders_count || 0} pending orders`,
        timestamp: new Date(),
      });
    });

    newSocket.on('alert', (data) => {
      console.log('🚨 Alert:', data);
      addNotification({
        type: 'alert',
        title: data.data?.alert_type || 'Alert',
        message: data.data?.message || 'System alert',
        severity: data.data?.severity || 'info',
        timestamp: new Date(),
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 