import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    organizationName: 'Hope Foundation NGO',
    email: 'contact@hopefoundation.org',
    phone: '+91 22 1234 5678',
    pushNotifications: false,
    emailNotifications: false,
    autoCheckout: false,
    requireEmail: false,
    requireOrganization: false,
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleSaveChanges = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleChangePassword = () => {
    alert('Password change functionality to be implemented');
  };

  const handleExportData = () => {
    alert('Export data functionality to be implemented');
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
              <button className="security-btn" onClick={handleChangePassword}>
                Change Password
              </button>
              <button className="security-btn" onClick={handleExportData}>
                Export Data
              </button>
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
    </div>
  );
};

export default Settings;
