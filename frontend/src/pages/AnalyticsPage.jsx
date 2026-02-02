import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getVisitors, checkoutVisitor } from '../api/api';
import '../styles/Analytics.css';

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState('daily');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitorsData();
  }, []);

  const fetchVisitorsData = async () => {
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

  const filteredVisitors = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (timePeriod === 'daily') {
      startDate.setDate(now.getDate() - 30);
    } else if (timePeriod === 'monthly') {
      startDate.setMonth(now.getMonth() - 12);
    } else if (timePeriod === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 5);
    } else {
      startDate = new Date(0); // All time
    }

    return visitors.filter(v => {
      if (!v.check_in_time) return false;
      const date = new Date(v.check_in_time);
      return date >= startDate;
    });
  }, [visitors, timePeriod]);

  const visitsTrendData = useMemo(() => {
    const counts = {};

    // Formatter helpers
    let formatKey = (date) => date.toISOString().split('T')[0];
    let labelFormat = (date_str) => new Date(date_str).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    if (timePeriod === 'monthly' || timePeriod === 'alltime') {
      formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      labelFormat = (date_str) => new Date(date_str + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (timePeriod === 'yearly') {
      formatKey = (date) => `${date.getFullYear()}`;
      labelFormat = (date_str) => date_str;
    }

    filteredVisitors.forEach((visitor) => {
      const date = new Date(visitor.check_in_time);
      const key = formatKey(date);
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).sort().map(key => ({
      day: labelFormat(key),
      visits: counts[key],
      rawKey: key
    }));
  }, [filteredVisitors, timePeriod]);

  const visitorTypeData = useMemo(() => {
    const typeCounts = {};
    filteredVisitors.forEach((visitor) => {
      const type = visitor.purpose || 'General';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const total = filteredVisitors.length;
    if (total === 0) return [];

    return Object.entries(typeCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
    }));
  }, [filteredVisitors]);

  const dailyVisitsData = useMemo(() => {
    return visitsTrendData;
  }, [visitsTrendData]);

  const stats = useMemo(() => {
    const totalVisits = filteredVisitors.length;
    const currentlyInside = visitors.filter(v => !v.check_out_time).length; // Keep global for "Currently Inside"
    const uniqueVisitors = new Set(filteredVisitors.map(v => v.email || v.phone)).size;

    const completedVisits = filteredVisitors.filter(v => v.check_out_time);
    const avgDuration = completedVisits.length > 0
      ? completedVisits.reduce((sum, v) => {
        const duration = (new Date(v.check_out_time) - new Date(v.check_in_time)) / (1000 * 60);
        return sum + duration;
      }, 0) / completedVisits.length
      : 0;

    let periodLabel = 'All time';
    if (timePeriod === 'daily') periodLabel = 'Last 30 days';
    if (timePeriod === 'monthly') periodLabel = 'Last 12 months';
    if (timePeriod === 'yearly') periodLabel = 'Last 5 years';

    return [
      { label: 'Total Visits', value: totalVisits, detail: periodLabel },
      { label: 'Unique Visitors', value: uniqueVisitors, detail: 'In this period' },
      { label: 'Currently Inside', value: currentlyInside, detail: 'Right now (Total)' },
      { label: 'Avg. Visit Duration', value: avgDuration > 0 ? `${Math.round(avgDuration)} min` : 'N/A', detail: 'In this period' },
    ];
  }, [filteredVisitors, visitors, timePeriod]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleCheckout = async (visitorId) => {
    try {
      await checkoutVisitor(visitorId);
      // Refresh visitor data
      await fetchVisitorsData();
      alert('Visitor checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error checking out: ' + (error.response?.data?.message || error.message));
    }
  };

  const activeVisitors = visitors.filter(v => !v.check_out_time);

  if (loading) {
    return <div className="loading-state">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Visitor statistics and trends</p>
        </div>
        <div className="time-filter">
          {[
            { label: 'Daily', value: 'daily' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
            { label: 'All Time', value: 'alltime' }
          ].map((period) => (
            <button
              key={period.value}
              className={`filter-btn ${timePeriod === period.value ? 'active' : ''}`}
              onClick={() => setTimePeriod(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-detail">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Visits Trend</h2>
            <p>Visitor check-ins over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitsTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2>Visitor Type Distribution</h2>
            <p>Breakdown by visitor categories</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visitorTypeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {visitorTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container full-width">
        <div className="chart-header">
          <h2>Daily Visits Comparison</h2>
          <p>Visit volume by day</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyVisitsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="visits" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Active Visitors Section */}
      <div className="chart-container full-width" style={{ marginTop: '2rem' }}>
        <div className="chart-header">
          <h2>Active Visitors</h2>
          <p>Visitors currently inside the premises</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="active-visitors-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f9fafb',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>Name</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>Check-in Time</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>Purpose</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151'
                }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeVisitors.length > 0 ? (
                activeVisitors.map((visitor) => (
                  <tr key={visitor.id} style={{
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <td style={{ padding: '1rem', color: '#111827' }}>{visitor.name}</td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {new Date(visitor.check_in_time).toLocaleString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{visitor.purpose}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleCheckout(visitor.id)}
                        style={{
                          backgroundColor: '#6366f1',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.875rem'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    No active visitors
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
