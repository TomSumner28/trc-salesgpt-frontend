import React from 'react';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-6">
        <h1 className="text-2xl font-bold mb-6">TRC SalesGPT</h1>
        <nav className="space-y-4">
          <a href="#" className="block text-gray-300 hover:text-white">Dashboard</a>
          <a href="#" className="block text-gray-300 hover:text-white">Team</a>
          <a href="#" className="block text-gray-300 hover:text-white">Knowledge Base</a>
          <a href="#" className="block text-gray-300 hover:text-white">Quick Response</a>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Link Microsoft</button>
        </header>
        <div className="text-gray-400">Your sales and email insights will appear here.</div>
      </main>
    </div>
  );
}