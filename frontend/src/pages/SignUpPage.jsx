import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addUser } from '../api/api';
import '../components/LoginForm.css'; // Reuse login styles

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'security' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await addUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                status: 'Active'
            });

            alert('Account created successfully! Please login.');
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.response?.data?.error || 'Failed to create account');
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

                <h1 className="login-title">Create Account</h1>
                <p className="login-subtitle">Join Rachana Visitor Management</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="form-input"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="form-input"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="security">Security Guard</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="form-input"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="form-input"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="account-options" style={{ textAlign: 'center', display: 'block' }}>
                        <span className="option-text">Already have an account? </span>
                        <Link to="/" className="option-link">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
