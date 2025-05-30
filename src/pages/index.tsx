import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    axios.get('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Dashboard fetch error:', err));
  }, []);

  if (!summary) return <div className="text-white p-4">Loading dashboard...</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📊 TRC SalesGPT Dashboard</h1>
      <div className="mb-4">Total Emails: <strong>{summary.totalEmails}</strong></div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Top Senders</h2>
        <ul className="list-disc list-inside">
          {summary.topSenders.map((s: any, i: number) => (
            <li key={i}>{s.email} — {s.count}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Email Volume Per Day</h2>
        <ul className="list-disc list-inside">
          {Object.entries(summary.emailsPerDay).map(([date, count]: any, i) => (
            <li key={i}>{date}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}