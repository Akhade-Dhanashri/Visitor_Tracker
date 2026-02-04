import { useState } from 'react';
import { login } from '../api/api';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const user = await login({ email, password });

      if (user.role !== 'admin' && user.role !== 'security') {
        setError('Access denied. Restricted to Admin and Security personnel.');
        return;
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);

      if (onLogin) {
        onLogin(user.role);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/rachana_logo_new.jpg" alt="Rachana Logo" className="logo-image" style={{ maxWidth: '200px', height: 'auto' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="login-title">Rachana Visitor Management</h1>
        <p className="login-subtitle">Authorized Access Only (Admin & Security)</p>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '1.2rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Login
          </button>

          {/* Demo Hint */}

          {/* Account Options */}
          {/* Account Options */}
          <div className="account-options">

            <div className="option-item">
              <Link to="/forgot-password" className="option-link">Forgot Password?</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

