import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Email Dashboard</h2>
      {summary ? (
        <>
          <p>Total Emails: {summary.totalEmails}</p>
          <h3 className="mt-6 text-xl font-semibold">Top Senders</h3>
          <ul className="list-disc ml-6">
            {summary.topSenders.map(s => (
              <li key={s.email}>
                {s.email} - {s.count}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading dashboard data...</p>
      )}
    </div>
  );
};

export default Dashboard;