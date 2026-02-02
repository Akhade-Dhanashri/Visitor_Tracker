import React, { useState } from 'react';
import './VisitorLog.css';

const VisitorLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('all');

  // Sample data - in real app, fetch from API
  const visitors = [];

  const stats = {
    totalVisits: 0,
    currentlyInside: 0,
    checkedOut: 0,
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="visitor-log">
      <div className="page-header">
        <div className="header-content">
          <h1>Visitor Log</h1>
          <p>View historical visitor records</p>
        </div>
        <div className="date-selector">
          <button className="date-nav-btn">←</button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button className="date-nav-btn">→</button>
          <button className="today-btn">Today</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>{formatDate(selectedDate)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚪</div>
          <div className="stat-content">
            <h3>{stats.currentlyInside}</h3>
            <p>Not checked out</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.checkedOut}</h3>
            <p>Completed visits</p>
          </div>
        </div>
      </div>

      <div className="visitor-filter">
        <button
          className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Visitors (0)
        </button>
        <button
          className={`filter-tab ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          Checked In (0)
        </button>
        <button
          className={`filter-tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          Checked Out (0)
        </button>
      </div>

      <div className="visitor-table-container">
        <div className="section-header">
          <h2>All Visitors</h2>
          <p>Complete list of visitors for {formatDate(selectedDate)}</p>
        </div>

        <table className="visitor-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Visitor Type</th>
              <th>Check-in Time</th>
              <th>Check-out Time</th>
              <th>Duration</th>
              <th>Purpose</th>
              <th>Checked By</th>
            </tr>
          </thead>
          <tbody>
            <tr className="empty-state">
              <td colSpan="8">No visitors found for this date</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorLog;
