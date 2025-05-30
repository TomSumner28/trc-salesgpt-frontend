import React, { useEffect, useState } from 'react';

const App = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(setSummary)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Email Dashboard</h1>
        <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Link Microsoft</button>
      </div>
      {summary ? (
        <>
          <p className="text-lg mb-4">Total Emails: {summary.totalEmails}</p>
          <h2 className="text-2xl font-semibold mb-2">Top Senders</h2>
          <ul className="list-disc pl-5 space-y-1">
            {summary.topSenders.map((s, i) => (
              <li key={i}>{s.email} - {s.count}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default App;