import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(response => setData(response.data))
      .catch(() => setData({ error: 'Failed to load data' }));
  }, []);

  if (!data) return <div className="text-white">Loading...</div>;
  if (data.error) return <div className="text-red-500">{data.error}</div>;

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold">Email Dashboard</h1>
      <p>Total Emails: {data.totalEmails}</p>
      <h2 className="mt-4 text-xl font-semibold">Top Senders</h2>
      <ul className="list-disc ml-5">
        {data.topSenders.map((sender, idx) => (
          <li key={idx}>{sender.email} - {sender.count}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
