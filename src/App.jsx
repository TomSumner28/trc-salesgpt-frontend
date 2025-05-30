import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="flex h-screen bg-darkbg font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-panel">
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <button className="bg-trcblue text-white px-4 py-2 rounded hover:opacity-80 transition">Link Microsoft</button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;