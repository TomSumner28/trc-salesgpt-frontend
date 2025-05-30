import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="text-white">Loading dashboard...</div>;

  const chartData = Object.entries(data.emailsPerDay || {}).map(([date, count]) => ({
    date, count,
  }));

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Email Dashboard</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-xl mb-2">Total Emails</h3>
          <p className="text-4xl font-semibold">{data.totalEmails}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-xl mb-4">Emails Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0f4c81" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8 bg-gray-800 p-4 rounded-2xl shadow">
        <h3 className="text-xl mb-4">Top Senders</h3>
        <ul className="list-disc pl-6 space-y-1">
          {data.topSenders.map((sender, i) => (
            <li key={i}>{sender.email} – {sender.count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}