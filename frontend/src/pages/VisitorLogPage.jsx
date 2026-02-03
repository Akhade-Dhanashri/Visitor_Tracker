import React, { useState, useEffect } from 'react';
import { getVisitors, downloadVisitorReport } from '../api/api';
import '../styles/VisitorLog.css';

const VisitorLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('all');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Download State
  const [downloadStartDate, setDownloadStartDate] = useState('');
  const [downloadEndDate, setDownloadEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDownloadReport = async (format) => {
    try {
      setIsExporting(true);
      const blob = await downloadVisitorReport(format, downloadStartDate, downloadEndDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let extension = 'csv';
      if (format === 'excel') extension = 'xlsx';
      if (format === 'pdf') extension = 'pdf';

      a.download = `visitor_report_${downloadStartDate || 'all'}_to_${downloadEndDate || 'all'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      let errorMessage = 'Failed to export data';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      // If it's a blob error, we might need to read it
      if (error.response && error.response.data instanceof Blob) {
        // It's a blob, but it might contain JSON error
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          if (json.error) errorMessage = json.error;
        } catch (e) {
          // Not JSON
        }
      }

      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
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

        <div className="header-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="download-controls" style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center',
            backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Download:</span>
            <input
              type="date"
              value={downloadStartDate}
              onChange={(e) => setDownloadStartDate(e.target.value)}
              className="date-input-small"
              title="Start Date"
              style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
            />
            <span style={{ color: '#9ca3af' }}>-</span>
            <input
              type="date"
              value={downloadEndDate}
              onChange={(e) => setDownloadEndDate(e.target.value)}
              className="date-input-small"
              title="End Date"
              style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
            />
            <div className="btn-group-tiny" style={{ display: 'flex', gap: '2px' }}>
              <button onClick={() => handleDownloadReport('csv')} disabled={isExporting} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px 0 0 4px', cursor: 'pointer' }}>CSV</button>
              <button onClick={() => handleDownloadReport('excel')} disabled={isExporting} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderLeft: 'none', cursor: 'pointer' }}>XLS</button>
              <button onClick={() => handleDownloadReport('pdf')} disabled={isExporting} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderLeft: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>PDF</button>
            </div>
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
