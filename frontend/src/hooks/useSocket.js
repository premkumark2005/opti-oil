import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (onEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    // New order notification (for admins)
    socket.on('new_order', (data) => {
      toast.info(`🛒 New order received from ${data.wholesaler}`, {
        position: 'top-right',
        autoClose: 5000
      });
      onEvent?.('new_order', data);
    });

    // Order approved notification (for wholesalers)
    socket.on('order_approved', (data) => {
      toast.success(`✅ Order ${data.orderNumber} has been approved!`, {
        position: 'top-right',
        autoClose: 5000
      });
      onEvent?.('order_approved', data);
    });

    // Order rejected notification (for wholesalers)
    socket.on('order_rejected', (data) => {
      toast.error(`❌ Order ${data.orderNumber} was rejected`, {
        position: 'top-right',
        autoClose: 5000
      });
      onEvent?.('order_rejected', data);
    });

    // Order status update
    socket.on('order_status_updated', (data) => {
      toast.info(`📦 Order ${data.orderNumber} status: ${data.status}`, {
        position: 'top-right',
        autoClose: 4000
      });
      onEvent?.('order_status_updated', data);
    });

    // Low stock alert (for admins)
    socket.on('low_stock_alert', (data) => {
      toast.warning(`⚠️ Low stock alert: ${data.productName}`, {
        position: 'top-right',
        autoClose: 6000
      });
      onEvent?.('low_stock_alert', data);
    });

    // Inventory updated
    socket.on('inventory_updated', (data) => {
      onEvent?.('inventory_updated', data);
    });

    // Product updated
    socket.on('product_updated', (data) => {
      onEvent?.('product_updated', data);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [onEvent]);

  return socketRef.current;
};

export default useSocket;
