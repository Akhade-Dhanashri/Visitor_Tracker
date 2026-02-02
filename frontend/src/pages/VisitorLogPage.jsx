import React, { useState, useEffect } from 'react';
import { getVisitors } from '../api/api';
import '../styles/VisitorLog.css';

const VisitorLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('all');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const stats = {
    totalVisits: visitors.filter(v => new Date(v.check_in_time).toLocaleDateString('en-CA') === selectedDate).length,
    currentlyInside: visitors.filter(v => new Date(v.check_in_time).toLocaleDateString('en-CA') === selectedDate && !v.check_out_time).length,
    checkedOut: visitors.filter(v => new Date(v.check_in_time).toLocaleDateString('en-CA') === selectedDate && v.check_out_time).length,
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <div className="loading-state">Loading visitor log...</div>;
  }

  const filteredVisitors = visitors.filter(visitor => {
    // 1. Filter by Date
    // Convert check_in_time to YYYY-MM-DD local time for valid comparison
    const visitorDate = new Date(visitor.check_in_time).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (visitorDate !== selectedDate) return false;

    // 2. Filter by Tab
    if (activeTab === 'checkin') return !visitor.check_out_time;
    if (activeTab === 'checkout') return !!visitor.check_out_time;
    return true; // 'all' tab
  });

  return (
    <div className="visitor-log">
      {/* ... header ... */}
      <div className="page-header">
        <div className="header-content">
          <h1>Visitor Log</h1>
          <p>View historical visitor records</p>
        </div>
        <div className="date-selector">
          <button className="date-nav-btn" onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().split('T')[0]);
          }}>←</button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button className="date-nav-btn" onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split('T')[0]);
          }}>→</button>
          <button className="today-btn" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>Total for {formatDate(selectedDate)}</p>
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
          All Visitors ({stats.totalVisits})
        </button>
        <button
          className={`filter-tab ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          Checked In ({stats.currentlyInside})
        </button>
        <button
          className={`filter-tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          Checked Out ({stats.checkedOut})
        </button>
      </div>

      <div className="visitor-table-container">
        <div className="section-header">
          <h2>{activeTab === 'all' ? 'All Visitors' : activeTab === 'checkin' ? 'Checked In Visitors' : 'Checked Out Visitors'}</h2>
          <p>List for {formatDate(selectedDate)}</p>
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
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td className="visitor-name">{visitor.name}</td>
                  <td>{visitor.email}<br />{visitor.phone}</td>
                  <td>{visitor.company || 'Individual'}</td>
                  <td>{new Date(visitor.check_in_time).toLocaleString()}</td>
                  <td>{visitor.check_out_time ? new Date(visitor.check_out_time).toLocaleString() : 'Not checked out'}</td>
                  <td>
                    {visitor.check_out_time ?
                      Math.floor((new Date(visitor.check_out_time) - new Date(visitor.check_in_time)) / (1000 * 60)) + ' min' :
                      'In progress'
                    }
                  </td>
                  <td>{visitor.purpose}</td>
                  <td>{visitor.host_name || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr className="empty-state">
                <td colSpan="8">No visitors found for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorLog;
