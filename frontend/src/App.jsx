import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminWholesalers from './pages/admin/AdminWholesalers';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminProfile from './pages/admin/AdminProfile';

// Wholesaler Pages
import WholesalerDashboard from './pages/wholesaler/WholesalerDashboard';
import WholesalerProducts from './pages/wholesaler/WholesalerProducts';
import WholesalerOrders from './pages/wholesaler/WholesalerOrders';
import WholesalerNotifications from './pages/wholesaler/WholesalerNotifications';
import WholesalerProfile from './pages/wholesaler/WholesalerProfile';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Protected Routes with Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} 
        />
        <Route 
          path="/admin/inventory" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminInventory /></PrivateRoute>} 
        />
        <Route 
          path="/admin/orders" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminOrders /></PrivateRoute>} 
        />
        <Route 
          path="/admin/products" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminProducts /></PrivateRoute>} 
        />
        <Route 
          path="/admin/suppliers" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminSuppliers /></PrivateRoute>} 
        />
        <Route 
          path="/admin/wholesalers" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminWholesalers /></PrivateRoute>} 
        />
        <Route 
          path="/admin/reports" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminReports /></PrivateRoute>} 
        />
        <Route 
          path="/admin/notifications" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminNotifications /></PrivateRoute>} 
        />
        <Route 
          path="/admin/profile" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminProfile /></PrivateRoute>} 
        />

        {/* Wholesaler Routes */}
        <Route 
          path="/wholesaler/dashboard" 
          element={<PrivateRoute allowedRoles={['wholesaler']}><WholesalerDashboard /></PrivateRoute>} 
        />
        <Route 
          path="/wholesaler/products" 
          element={<PrivateRoute allowedRoles={['wholesaler']}><WholesalerProducts /></PrivateRoute>} 
        />
        <Route 
          path="/wholesaler/orders" 
          element={<PrivateRoute allowedRoles={['wholesaler']}><WholesalerOrders /></PrivateRoute>} 
        />
        <Route 
          path="/wholesaler/notifications" 
          element={<PrivateRoute allowedRoles={['wholesaler']}><WholesalerNotifications /></PrivateRoute>} 
        />
        <Route 
          path="/wholesaler/profile" 
          element={<PrivateRoute allowedRoles={['wholesaler']}><WholesalerProfile /></PrivateRoute>} 
        />

        {/* Root redirect based on role */}
        <Route 
          path="/" 
          element={
            user?.role === 'admin' 
              ? <Navigate to="/admin/dashboard" replace /> 
              : <Navigate to="/wholesaler/dashboard" replace />
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
