import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SecurityDashboardPage from './pages/SecurityDashboardPage.jsx';
import VisitorLogPage from './pages/VisitorLogPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

import Sidebar from './components/Sidebar.jsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(loggedIn);
    setUserRole(role);
    setLoading(false);

    // Listen for storage changes (e.g., from another tab)
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(loggedIn);
      setUserRole(role);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar onLogout={handleLogout} userRole={userRole} />}
        <div className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  userRole === 'security' ? (
                    <SecurityDashboardPage />
                  ) : (
                    <AnalyticsPage />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/visitor-log"
              element={
                isAuthenticated ? (
                  <VisitorLogPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                isAuthenticated ? (
                  <AnalyticsPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/user-management"
              element={
                isAuthenticated ? (
                  userRole === 'admin' ? (
                    <UserManagementPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? (
                  <SettingsPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
