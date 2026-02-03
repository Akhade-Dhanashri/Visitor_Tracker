import React, { useState, useEffect } from 'react';
import { changePassword, downloadVisitorReport, getSettings, updateSettings } from '../api/api';
import '../styles/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    organizationName: '',
    email: '',
    phone: '',
    pushNotifications: false,
    emailNotifications: false,
    autoCheckout: false,
    requireEmail: false,
    requireOrganization: false,
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passError, setPassError] = useState('');

  // Fetch settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Keep default empty state or show start
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleSaveChanges = async () => {
    try {
      await updateSettings(settings);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPassError('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters");
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setPassError("User ID not found. Please log in again.");
        return;
      }

      await changePassword({
        user_id: userId,
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      alert('Password updated successfully!');
      setShowPasswordModal(false);
    } catch (err) {
      console.error("Change password error:", err);
      setPassError(err.response?.data?.error || "Failed to update password");
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const blob = await downloadVisitorReport(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Set extension based on format
      let extension = 'csv';
      if (format === 'excel') extension = 'xlsx';
      if (format === 'pdf') extension = 'pdf';

      a.download = `visitor_report_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all visitor data? This action cannot be undone.')) {
      alert('Visitor data cleared');
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage system configuration and preferences</p>
      </div>

      <div className="settings-container">
        {/* Organization Details Section */}
        <div className="settings-section">
          <div className="section-icon">🏢</div>
          <div className="section-content">
            <h2>Organization Details</h2>
            <p>Update your organization information</p>

            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) =>
                  handleInputChange('organizationName', e.target.value)
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-icon">🔔</div>
          <div className="section-content">
            <h2>Notifications</h2>
            <p>Configure notification preferences</p>

            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h3>Push Notifications</h3>
                  <p>Receive notifications for new visitors</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={() => handleToggle('pushNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h3>Email Notifications</h3>
                  <p>Send daily reports via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Visitor Management Section */}
        <div className="settings-section">
          <div className="section-icon">⚙️</div>
          <div className="section-content">
            <h2>Visitor Management</h2>
            <p>Configure visitor check-in/out settings</p>

            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h3>Auto Check-out</h3>
                  <p>Automatically check out visitors after set hours</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoCheckout}
                    onChange={() => handleToggle('autoCheckout')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h3>Require Email Address</h3>
                  <p>Make email mandatory for new visitors</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.requireEmail}
                    onChange={() => handleToggle('requireEmail')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h3>Require Organization</h3>
                  <p>Make organization mandatory for new visitors</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.requireOrganization}
                    onChange={() => handleToggle('requireOrganization')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="settings-section">
          <div className="section-icon">🔒</div>
          <div className="section-content">
            <h2>Security</h2>
            <p>Security and privacy settings</p>

            <div className="button-group">
              <button className="security-btn" onClick={handleChangePasswordClick}>
                Change Password
              </button>

              <div className="export-group" style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
                <button className="security-btn" onClick={() => handleExport('csv')} title="Export CSV">
                  📄 CSV
                </button>
                <button className="security-btn" onClick={() => handleExport('excel')} title="Export Excel">
                  📊 Excel
                </button>
                <button className="security-btn" onClick={() => handleExport('pdf')} title="Export PDF">
                  📑 PDF
                </button>
              </div>

              <button
                className="security-btn danger"
                onClick={handleClearData}
              >
                Clear All Visitor Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="cancel-btn">Cancel</button>
        <button className="save-btn" onClick={handleSaveChanges}>
          Save Changes
        </button>
      </div>

      {savedMessage && (
        <div className="success-message">✓ Changes saved successfully!</div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
            width: '400px', maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#1a1a1a' }}>Change Password</h2>
            <form onSubmit={submitPasswordChange}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                    border: '1px solid #d1d5db', fontSize: '0.95rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                    border: '1px solid #d1d5db', fontSize: '0.95rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                    border: '1px solid #d1d5db', fontSize: '0.95rem'
                  }}
                />
              </div>

              {passError && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{passError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="cancel-btn"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
