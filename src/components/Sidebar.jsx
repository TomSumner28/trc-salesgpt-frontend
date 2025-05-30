import React from 'react';
import { FaUsers, FaFileAlt, FaRocket, FaChartPie } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-panel text-white p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-10">TRC SalesGPT</h2>
      <nav className="space-y-4">
        <a href="#" className="flex items-center gap-2 hover:text-trcblue"><FaChartPie /> Dashboard</a>
        <a href="#" className="flex items-center gap-2 hover:text-trcblue"><FaUsers /> Team</a>
        <a href="#" className="flex items-center gap-2 hover:text-trcblue"><FaFileAlt /> Knowledge Base</a>
        <a href="#" className="flex items-center gap-2 hover:text-trcblue"><FaRocket /> Quick Response</a>
      </nav>
    </aside>
  );
}