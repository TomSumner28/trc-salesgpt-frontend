import React, { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Email Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <>
          <p className="mb-4">Total Emails: {data.totalEmails}</p>
          <h2 className="text-2xl font-semibold mb-2">Top Senders</h2>
          <ul className="list-disc list-inside">
            {data.topSenders.map((sender, idx) => (
              <li key={idx}>{sender.email} - {sender.count}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}