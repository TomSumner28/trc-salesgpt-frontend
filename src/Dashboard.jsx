import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard data.');
      });
  }, []);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!summary) return <div className="p-4 text-white">Loading dashboard...</div>;

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">📊 TRC SalesGPT Dashboard</h1>
      <div className="mb-4">Total Emails: <strong>{summary.totalEmails}</strong></div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Top Senders</h2>
        <ul className="list-disc list-inside mt-2">
          {summary.topSenders.map((sender, i) => (
            <li key={i}>{sender.email} — {sender.count}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Email Volume Per Day</h2>
        <ul className="list-disc list-inside mt-2">
          {Object.entries(summary.emailsPerDay).map(([date, count], i) => (
            <li key={i}>{date}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}