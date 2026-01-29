import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      // Silently fail for unread count - don't spam user with errors
      console.error('Failed to fetch unread count:', error);
      // Keep the last known count, don't reset to 0
    }
  };

  const notificationPath = user?.role === 'admin' 
    ? '/admin/notifications' 
    : '/wholesaler/notifications';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>Opti-Oil</h1>
        </Link>

        <div className="navbar-actions">
          {/* Notifications */}
          <Link to={notificationPath} className="navbar-icon">
            <span className="icon">🔔</span>
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </Link>

          {/* Profile Menu */}
          <div className="navbar-profile">
            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <span className="profile-name">{user?.name}</span>
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <p className="profile-email">{user?.email}</p>
                  <p className="profile-role">{user?.role}</p>
                </div>
                <hr />
                <Link 
                  to={user?.role === 'admin' ? '/admin/profile' : '/wholesaler/profile'} 
                  className="profile-menu-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  ⚙️ Settings
                </Link>
                <button onClick={logout} className="logout-button">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
