import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/LoginForm.css'; // Reuse login styles

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${baseUrl}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const data = await response.json();
                alert('Error: ' + (data.error || 'Failed to send reset email'));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo */}
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src="/rachana_logo_new.jpg" alt="Rachana Logo" className="logo-image" />
                    </div>
                </div>

                <h1 className="login-title">Reset Password</h1>
                <p className="login-subtitle">Enter your email to receive instructions</p>

                {!submitted ? (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                required
                                className="form-input"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="success-message" style={{ padding: '2rem 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>Check your email</h3>
                        <p style={{ color: '#4B5563', lineHeight: '1.5' }}>
                            We have sent a password reset link to<br />
                            <strong>{email}</strong>
                        </p>
                    </div>
                )}

                <div className="account-options" style={{ textAlign: 'center', display: 'block', marginTop: '2rem' }}>
                    <Link to="/" className="option-link">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
