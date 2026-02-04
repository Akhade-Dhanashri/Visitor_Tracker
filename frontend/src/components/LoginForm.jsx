import { useState } from 'react';
import { login } from '../api/api';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <p className="login-subtitle">Secure Visitor Access Portal</p>

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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
            />
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

