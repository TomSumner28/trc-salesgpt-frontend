import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-10 text-center text-lg">Loading dashboard...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Email Dashboard</h1>
      <p>Total Emails: {data.totalEmails}</p>
      <h2 className="mt-6 text-xl font-semibold">Top Senders</h2>
      <ul className="list-disc list-inside">
        {data.topSenders.map(sender => (
          <li key={sender.email}>{sender.email} - {sender.count}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;