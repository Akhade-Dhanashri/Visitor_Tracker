import { useState } from 'react';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './SecurityLoginPage.css';

const SecurityLoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!email || !password) {
                setError('Please enter both email and password');
                return;
            }

            const user = await login({ email, password });

            if (user.role !== 'security') {
                setError('Access denied. Security credentials required.');
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
        <div className="security-login-container">
            <div className="security-login-card">
                {/* Logo */}
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src="/rachana_logo_new.jpg" alt="Rachana Logo" className="logo-image" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="login-title">Security Portal</h1>
                <p className="login-subtitle">Rachana Visitor Management System</p>

                {/* Form */}
                <form className="login-form" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Security Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter security email"
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
                        className="btn-primary security-btn"
                        style={{ marginTop: '1rem' }}
                    >
                        Security Login
                    </button>

                    {/* Account Options */}
                    <div className="account-options">
                        <div className="option-item">
                            <a href="#" className="option-link" onClick={(e) => { e.preventDefault(); alert('Please contact your administrator to reset your password.'); }}>Forgot Password?</a>
                        </div>
                        <div className="option-item">
                            <span className="option-text">Administrator?</span>
                            <a href="/admin-login" className="option-link" onClick={(e) => { e.preventDefault(); navigate('/admin-login'); }}>Admin Login</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecurityLoginPage;
