import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/products', label: 'Products', icon: '🏷️' },
    { path: '/admin/wholesalers', label: 'Wholesalers', icon: '👥' },
    { path: '/admin/supplier-management', label: 'Supplier Users', icon: '👤' },
    { path: '/admin/raw-material-ordering', label: 'Raw Materials', icon: '🌾' },
    { path: '/admin/raw-material-orders', label: 'RM Orders', icon: '📋' },
    { path: '/admin/raw-material-inventory', label: 'Raw Inventory', icon: '📊' },
    { path: '/admin/raw-material-reports', label: 'RM Reports', icon: '📈' },
    { path: '/admin/reports', label: 'Reports', icon: '📄' },
    { path: '/admin/notifications', label: 'Notifications', icon: '🔔' }
  ];

  const wholesalerLinks = [
    { path: '/wholesaler/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/wholesaler/products', label: 'Products', icon: '🏷️' },
    { path: '/wholesaler/orders', label: 'My Orders', icon: '🛒' },
    { path: '/wholesaler/notifications', label: 'Notifications', icon: '🔔' }
  ];

  const links = user?.role === 'admin' ? adminLinks : wholesalerLinks;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
