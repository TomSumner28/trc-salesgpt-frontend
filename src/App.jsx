
import React, { useEffect, useState } from 'react';
import './index.css';
import { FaTachometerAlt, FaUsers, FaBook, FaComments } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(() => setError(true));
  }, []);

  const emailsPerDayData = summary?.emailsPerDay
    ? Object.entries(summary.emailsPerDay).map(([date, count]) => ({ date, count }))
    : [];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '250px', background: '#1e293b', padding: '20px', color: 'white' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>TRC SalesGPT</h1>
        <nav>
          <p><FaTachometerAlt /> Dashboard</p>
          <p><FaUsers /> Team</p>
          <p><FaBook /> Knowledge Base</p>
          <p><FaComments /> Quick Response</p>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '40px', background: '#0f172a', color: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '28px' }}>Dashboard</h2>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px' }}>Link Microsoft</button>
        </div>
        {error && <p style={{ color: 'red' }}>Failed to load dashboard data.</p>}
        {summary && (
          <div>
            <p style={{ fontSize: '20px' }}>Total Emails: {summary.totalEmails}</p>
            <h3 style={{ fontSize: '22px', marginTop: '20px' }}>Top Senders</h3>
            <ul>
              {summary.topSenders.map((sender, idx) => (
                <li key={idx}>{sender.email} - {sender.count}</li>
              ))}
            </ul>
            <h3 style={{ fontSize: '22px', marginTop: '20px' }}>Emails Per Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emailsPerDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#f8fafc" />
                <YAxis stroke="#f8fafc" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
