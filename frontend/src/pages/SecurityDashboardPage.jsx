import React, { useState, useEffect } from 'react';
import { getVisitors, addVisitor, checkoutVisitor } from '../api/api';
import AddVisitorModal from '../components/AddVisitorModal';
import '../styles/SecurityDashboard.css';

const SecurityDashboard = ({ adminView = false }) => {
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [activeSection, setActiveSection] = useState('checkin');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (rest of state)

  // ... (useEffect and handlers)

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="security-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{adminView ? 'Visitor Entry' : 'Security Dashboard'}</h1>
          <p>{adminView ? 'Add or check in visitors' : 'Manage visitor check-ins and check-outs'}</p>
        </div>
        <button
          className="add-visitor-btn"
          onClick={() => setShowAddVisitorModal(true)}
        >
          👤 Add New Visitor
        </button>
      </div>

      {!adminView && (
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <span className="stat-detail">{stat.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-content">
        {!adminView && (
          <div className="section-tabs">
            <button
              className={`tab-btn ${activeSection === 'checkin' ? 'active' : ''}`}
              onClick={() => setActiveSection('checkin')}
            >
              Check In
            </button>
            <button
              className={`tab-btn ${activeSection === 'active' ? 'active' : ''}`}
              onClick={() => setActiveSection('active')}
            >
              Active Visitors
            </button>
          </div>
        )}

        {activeSection === 'checkin' && (
          <div className="checkin-section">
            <div className="section-header">
              <h2>Search Existing Visitor</h2>
              <p>Search for a registered visitor to check them in again</p>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name, mobile, or email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((visitor, idx) => (
                      <div
                        key={idx}
                        className="search-result-item"
                        onClick={() => handleSelectVisitor(visitor)}
                      >
                        <div className="result-info">
                          <span className="result-name">{visitor.name}</span>
                          <span className="result-detail">{visitor.email || visitor.phone}</span>
                        </div>
                        <button className="quick-add-btn">Select</button>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No visitors found</div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Check-ins Section */}
            <div className="section-header" style={{ marginTop: '2rem' }}>
              <h2>Recent Check-ins</h2>
              <p>Visitors checked in today</p>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="active-visitors-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email/Phone</th>
                    <th>Check-in Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length > 0 ? (
                    visitors
                      .filter(v => {
                        // Show today's visitors
                        const today = new Date().toISOString().split('T')[0];
                        const visitorDate = new Date(v.check_in_time).toISOString().split('T')[0];
                        return visitorDate === today;
                      })
                      .map((visitor) => (
                        <tr key={visitor.id}>
                          <td>{visitor.name}</td>
                          <td>{visitor.email || visitor.phone || '-'}</td>
                          <td>
                            {new Date(visitor.check_in_time).toLocaleString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </td>
                          <td>{visitor.purpose}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: visitor.check_out_time ? '#dcfce7' : '#dbeafe',
                              color: visitor.check_out_time ? '#166534' : '#1e40af'
                            }}>
                              {visitor.check_out_time ? 'Checked Out' : 'Inside'}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        No visitors checked in today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'active' && (
          <div className="active-visitors-section">
            <div className="section-header">
              <h2>Active Visitors</h2>
              <p>Visitors currently inside the premises</p>
            </div>
            <table className="active-visitors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Check-in Time</th>
                  <th>Purpose</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeVisitors.length > 0 ? (
                  activeVisitors.map((visitor, idx) => (
                    <tr key={idx}>
                      <td>{visitor.name}</td>
                      <td>{visitor.checkInTime}</td>
                      <td>{visitor.purpose}</td>
                      <td>
                        <button
                          className="checkout-btn"
                          onClick={() => handleCheckout(visitor.id)}
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      No active visitors
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {
        showAddVisitorModal && (
          <AddVisitorModal
            onClose={() => setShowAddVisitorModal(false)}
            onVisitorAdded={(newVisitor) => {
              setVisitors([newVisitor, ...visitors]);
              setShowAddVisitorModal(false);
            }}
            initialData={visitorForm}
          />
        )
      }
    </div>
  );
};

export default SecurityDashboard;
