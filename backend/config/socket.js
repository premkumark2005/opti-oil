import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

// Initialize Socket.IO
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their role room
    socket.join(socket.userRole);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Get Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit notification to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Emit notification to all admins
export const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};

// Emit notification to all wholesalers
export const emitToWholesalers = (event, data) => {
  if (io) {
    io.to('wholesaler').emit(event, data);
  }
};

// Emit notification to all users
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export default {
  initSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToWholesalers,
  emitToAll
};
