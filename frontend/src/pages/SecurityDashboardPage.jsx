import React, { useState, useEffect } from 'react';
import { getVisitors, addVisitor, checkoutVisitor } from '../api/api';
import '../styles/SecurityDashboard.css';

const SecurityDashboard = () => {
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [activeSection, setActiveSection] = useState('checkin');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorForm, setVisitorForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    organisation: '',
    visitorType: 'Parent',
    purpose: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const uniqueVisitors = new Map();

    visitors.forEach(v => {
      // Create a unique key based on email or phone or name
      const key = v.email || v.phone || v.name;
      if (!uniqueVisitors.has(key)) {
        if (
          (v.name && v.name.toLowerCase().includes(term)) ||
          (v.email && v.email.toLowerCase().includes(term)) ||
          (v.phone && v.phone.includes(term))
        ) {
          uniqueVisitors.set(key, v);
        }
      }
    });

    setSearchResults(Array.from(uniqueVisitors.values()).slice(0, 5));
  }, [searchTerm, visitors]);

  const handleSelectVisitor = (visitor) => {
    // Splits name into First/Last if possible
    const nameParts = visitor.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setVisitorForm({
      firstName,
      lastName,
      mobile: visitor.phone || '',
      email: visitor.email || '',
      organisation: visitor.company || '',
      visitorType: visitor.host_name || 'Parent', // storing type in host_name based on add logic
      purpose: '', // Purpose is usually new for each visit
    });
    setSearchTerm('');
    setShowAddVisitorModal(true);
  };

  // Fetch visitors on mount
  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const data = await getVisitors();
      setVisitors(data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Today's Visits", value: visitors.length, detail: 'Total check-ins today', icon: '📊' },
    { label: 'Currently Inside', value: visitors.filter(v => !v.check_out_time).length, detail: 'Visitors not checked out', icon: '🚪' },
    { label: 'Total Visitors', value: visitors.length, detail: 'Registered visitors', icon: '👥' },
    { label: 'Checked Out', value: visitors.filter(v => v.check_out_time).length, detail: "Today's check-outs", icon: '✓' },
  ];

  const activeVisitors = visitors.filter(v => !v.check_out_time).map(visitor => ({
    id: visitor.id,
    name: visitor.name,
    checkInTime: new Date(visitor.check_in_time).toLocaleTimeString(),
    purpose: visitor.purpose,
  }));

  const handleFormChange = (field, value) => {
    setVisitorForm({ ...visitorForm, [field]: value });
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        name: `${visitorForm.firstName} ${visitorForm.lastName}`,
        email: visitorForm.email,
        phone: visitorForm.mobile,
        purpose: visitorForm.purpose,
        company: visitorForm.organisation,
        host_name: visitorForm.visitorType,
      };
      const data = await addVisitor(formData);
      setVisitors([data, ...visitors]);
      setShowAddVisitorModal(false); // Corrected from setShowAddModal
      setVisitorForm({ // Corrected from setFormData
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        organisation: '',
        visitorType: 'Parent',
        purpose: '',
      });
      alert('Visitor checked in successfully!');
    } catch (error) {
      console.error('Error adding visitor:', error);
      alert('Error adding visitor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckout = async (visitorId) => {
    try {
      const updatedVisitor = await checkoutVisitor(visitorId);
      setVisitors(
        visitors.map((v) => (v.id === visitorId ? updatedVisitor : v))
      );
      alert('Visitor checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error checking out: ' + (error.response?.data?.message || error.message));
    }
  };



  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="security-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Security Dashboard</h1>
          <p>Manage visitor check-ins and check-outs</p>
        </div>
        <button
          className="add-visitor-btn"
          onClick={() => setShowAddVisitorModal(true)}
        >
          👤 Add New Visitor
        </button>
      </div>

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

      <div className="dashboard-content">
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
          <div className="modal-overlay" onClick={() => setShowAddVisitorModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Visitor</h2>
                <p>Fill in the visitor details and check them in</p>
                <button
                  className="close-btn"
                  onClick={() => setShowAddVisitorModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddVisitor} className="visitor-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={visitorForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={visitorForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    value={visitorForm.mobile}
                    onChange={(e) => handleFormChange('mobile', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={visitorForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Organisation</label>
                  <input
                    type="text"
                    value={visitorForm.organisation}
                    onChange={(e) => handleFormChange('organisation', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Visitor Type *</label>
                  <select
                    value={visitorForm.visitorType}
                    onChange={(e) => handleFormChange('visitorType', e.target.value)}
                  >
                    <option value="Parent">Parent</option>
                    <option value="Donor">Donor</option>
                    <option value="Trustee">Trustee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Purpose of Visit *</label>
                  <input
                    type="text"
                    value={visitorForm.purpose}
                    onChange={(e) => handleFormChange('purpose', e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddVisitorModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Visitor & Check In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default SecurityDashboard;
