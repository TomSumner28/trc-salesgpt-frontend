import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;