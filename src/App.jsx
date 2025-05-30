
import React from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
}
