import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://trc-salesgpt-backend.onrender.com/emails/summary')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-red-500">Failed to load dashboard data.</p>;

  const emailsOverTime = Object.entries(data.emailsPerDay || {}).map(([date, count]) => ({
    date, count,
  }));

  const topSenders = data.topSenders || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-panel p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Emails sent</h3>
          <p className="text-4xl font-bold text-white">{data.totalEmails}</p>
        </div>
        <div className="bg-panel p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Avg. reply time</h3>
          <p className="text-4xl font-bold text-white">4.2h</p>
        </div>
        <div className="bg-panel p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Reply rate</h3>
          <p className="text-4xl font-bold text-white">33%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-panel p-6 rounded-xl shadow">
          <h3 className="text-white mb-2">Emails Sent Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={emailsOverTime}>
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0f4c81" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-panel p-6 rounded-xl shadow">
          <h3 className="text-white mb-2">Reply Rate by Team Member</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'John', rate: 37 },
              { name: 'Sarah', rate: 29 },
              { name: 'Michael', rate: 35 },
            ]}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="rate" fill="#0f4c81" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}