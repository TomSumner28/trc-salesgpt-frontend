import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-trcblue text-white flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">TRC SalesGPT</h1>
      <nav className="flex flex-col gap-4">
        <a href="#" className="hover:underline">Dashboard</a>
        <a href="#" className="hover:underline">Team</a>
        <a href="#" className="hover:underline">Knowledge Base</a>
        <a href="#" className="hover:underline">Quick Response</a>
      </nav>
    </aside>
  );
}