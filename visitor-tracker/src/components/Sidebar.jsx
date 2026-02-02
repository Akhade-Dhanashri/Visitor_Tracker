import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Visitor Log', path: '/visitor-log', icon: '📋' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'User Management', path: '/user-management', icon: '👥' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">V</span>
        </div>
        <div className="sidebar-title">
          <h3>Visitor Tracker</h3>
          <p>Admin</p>
        </div>
      </div>

      <div className="menu">
        <p className="menu-label">Menu</p>
        <nav className="menu-items">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-name">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <span>🚪</span> Logout
      </button>
    </div>
  );
};

export default Sidebar;
