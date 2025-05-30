import React from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;