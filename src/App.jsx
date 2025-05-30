import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Team from './components/Team';
import KnowledgeBase from './components/KnowledgeBase';
import QuickResponse from './components/QuickResponse';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: 'white' }}>
      <nav style={{ width: '200px', padding: '1rem', background: '#1e293b' }}>
        <h2 style={{ color: '#3b82f6' }}>TRC SalesGPT</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/" style={{ color: 'white' }}>Dashboard</Link></li>
          <li><Link to="/team" style={{ color: 'white' }}>Team</Link></li>
          <li><Link to="/knowledge-base" style={{ color: 'white' }}>Knowledge Base</Link></li>
          <li><Link to="/quick-response" style={{ color: 'white' }}>Quick Response</Link></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/quick-response" element={<QuickResponse />} />
        </Routes>
      </main>
    </div>
  );
}
