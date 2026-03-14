import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
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

// Supplier Pages
import SupplierSignup from './pages/supplier/SupplierSignup';
import SupplierLogin from './pages/supplier/SupplierLogin';
import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierRawMaterials from './pages/supplier/SupplierRawMaterials';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierReports from './pages/supplier/SupplierReports';
import SupplierProfile from './pages/supplier/SupplierProfile';
import AdminSupplierManagement from './pages/admin/AdminSupplierManagement';
import AdminRawMaterialOrdering from './pages/admin/AdminRawMaterialOrdering';
import AdminRawMaterialInventory from './pages/admin/AdminRawMaterialInventory';
import AdminRawMaterialOrders from './pages/admin/AdminRawMaterialOrders';
import AdminRawMaterialReports from './pages/admin/AdminRawMaterialReports';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  const { user } = useAuth();

  return (
    <>
    <Routes>
      {/* Home Page */}
      <Route path="/" element={
        user?.role === 'admin' 
          ? <Navigate to="/admin/dashboard" replace /> 
          : user?.role === 'wholesaler'
          ? <Navigate to="/wholesaler/dashboard" replace />
          : user?.role === 'supplier'
          ? <Navigate to="/supplier/dashboard" replace />
          : <Home />
      } />

      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Supplier Public Routes */}
      <Route path="/supplier/signup" element={user ? <Navigate to="/" replace /> : <SupplierSignup />} />
      <Route path="/supplier/login" element={user ? <Navigate to="/" replace /> : <SupplierLogin />} />

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
        
        {/* Admin - Supplier Management Routes */}
        <Route 
          path="/admin/supplier-management" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminSupplierManagement /></PrivateRoute>} 
        />
        <Route 
          path="/admin/raw-material-ordering" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminRawMaterialOrdering /></PrivateRoute>} 
        />
        <Route 
          path="/admin/raw-material-inventory" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminRawMaterialInventory /></PrivateRoute>} 
        />
        <Route 
          path="/admin/raw-material-orders" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminRawMaterialOrders /></PrivateRoute>} 
        />
        <Route 
          path="/admin/raw-material-reports" 
          element={<PrivateRoute allowedRoles={['admin']}><AdminRawMaterialReports /></PrivateRoute>} 
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
      </Route>
      
      {/* Supplier Protected Routes with SupplierLayout */}
      <Route element={<PrivateRoute><SupplierLayout /></PrivateRoute>}>
        <Route 
          path="/supplier/dashboard" 
          element={<PrivateRoute allowedRoles={['supplier']}><SupplierDashboard /></PrivateRoute>} 
        />
        <Route 
          path="/supplier/raw-materials" 
          element={<PrivateRoute allowedRoles={['supplier']}><SupplierRawMaterials /></PrivateRoute>} 
        />
        <Route 
          path="/supplier/orders" 
          element={<PrivateRoute allowedRoles={['supplier']}><SupplierOrders /></PrivateRoute>} 
        />
        <Route 
          path="/supplier/reports" 
          element={<PrivateRoute allowedRoles={['supplier']}><SupplierReports /></PrivateRoute>} 
        />
        <Route 
          path="/supplier/profile" 
          element={<PrivateRoute allowedRoles={['supplier']}><SupplierProfile /></PrivateRoute>} 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    {user && <ChatbotWidget />}
    </>
  );
}

export default App;
