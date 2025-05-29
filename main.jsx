
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function Dashboard() {
  return <h2>Dashboard</h2>;
}
function Team() {
  return <h2>Team</h2>;
}
function KnowledgeBase() {
  return <h2>Knowledge Base</h2>;
}
function QuickResponse() {
  return <h2>Quick Response</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/quick-response" element={<QuickResponse />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
