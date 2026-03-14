import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to supplier login if trying to access supplier routes
    const isSupplierRoute = window.location.pathname.startsWith('/supplier');
    return <Navigate to={isSupplierRoute ? '/supplier/login' : '/login'} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Unauthorized - redirect to appropriate dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
