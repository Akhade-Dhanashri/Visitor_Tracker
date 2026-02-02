import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onLogout, userRole }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'security'] },
    { path: '/visitor-log', label: 'Visitor Log', icon: '📋', roles: ['admin', 'security'] },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin'] },
    { path: '/user-management', label: 'User Management', icon: '👥', roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin', 'security'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className="sidebar">
      {/* Header with Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-small">
            <img src="/rachana_logo_new.jpg" alt="Logo" />
          </div>
        </div>
        <div className="sidebar-title">
          <h3>Visitor Tracker</h3>
          <p>{userRole === 'admin' ? 'Admin' : 'Security'}</p>
        </div>
      </div>

      {/* Menu Label */}
      <div className="menu-label">Menu</div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
