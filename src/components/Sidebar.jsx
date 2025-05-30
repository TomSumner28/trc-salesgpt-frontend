
import React from 'react';
import { FaTachometerAlt, FaUsers, FaBook, FaCommentDots } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="w-64 bg-gray-800 p-6">
    <div className="text-2xl font-bold mb-8">TRC SalesGPT</div>
    <nav className="space-y-4">
      <a href="#" className="flex items-center space-x-2 text-white hover:text-blue-400">
        <FaTachometerAlt /> <span>Dashboard</span>
      </a>
      <a href="#" className="flex items-center space-x-2 text-white hover:text-blue-400">
        <FaUsers /> <span>Team</span>
      </a>
      <a href="#" className="flex items-center space-x-2 text-white hover:text-blue-400">
        <FaBook /> <span>Knowledge Base</span>
      </a>
      <a href="#" className="flex items-center space-x-2 text-white hover:text-blue-400">
        <FaCommentDots /> <span>Quick Response</span>
      </a>
    </nav>
  </aside>
);

export default Sidebar;
