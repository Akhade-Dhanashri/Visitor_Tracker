import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState('daily');

  // Sample data
  const visitsTrendData = [
    { day: 'Wed', visits: 0 },
    { day: 'Thu', visits: 0 },
    { day: 'Fri', visits: 0 },
    { day: 'Sat', visits: 0 },
    { day: 'Sun', visits: 0 },
    { day: 'Mon', visits: 0 },
    { day: 'Tue', visits: 0 },
  ];

  const visitorTypeData = [
    { name: 'Parent', value: 33, color: '#6366f1' },
    { name: 'Donor', value: 33, color: '#a855f7' },
    { name: 'Volunteer Coordinator', value: 17, color: '#f97316' },
    { name: 'Trustee', value: 17, color: '#ec4899' },
  ];

  const dailyVisitsData = [
    { day: 'Wed', visits: 0 },
    { day: 'Thu', visits: 0 },
    { day: 'Fri', visits: 0 },
    { day: 'Sat', visits: 0 },
    { day: 'Sun', visits: 0 },
    { day: 'Mon', visits: 0 },
    { day: 'Tue', visits: 0 },
  ];

  const stats = [
    { label: 'Total Visits', value: 0, detail: 'For the daily period' },
    { label: 'Unique Visitors', value: 0, detail: 'Different individuals' },
    { label: 'Currently Inside', value: 0, detail: 'Not checked out' },
    { label: 'Avg. Visit Duration', value: '0 min', detail: 'Average time spent' },
  ];

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Visitor statistics and trends</p>
        </div>
        <div className="time-filter">
          {['Daily', 'Monthly', 'Quarterly', 'Yearly', 'All Time'].map((period) => (
            <button
              key={period}
              className={`filter-btn ${timePeriod === period.toLowerCase() ? 'active' : ''}`}
              onClick={() => setTimePeriod(period.toLowerCase())}
            >
              {period}
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
    </div>
  );
};

export default Analytics;
