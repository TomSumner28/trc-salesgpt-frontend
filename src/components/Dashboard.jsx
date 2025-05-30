
import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Link Microsoft</button>
      </div>
      <div className="text-gray-400">Your sales and email insights will appear here.</div>
    </div>
  );
};

export default Dashboard;
