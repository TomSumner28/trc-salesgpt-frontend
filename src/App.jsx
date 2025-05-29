import React from 'react';
import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [response, setResponse] = useState('');
  const [input, setInput] = useState('');

  const generateReply = async () => {
    const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/salesgpt', { query: input });
    setResponse(res.data.reply || 'No response');
  };

  return (
    <div style={{ background: '#0f172a', color: '#60a5fa', minHeight: '100vh', padding: '2rem' }}>
      <h1>TRC SalesGPT</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste email or question..." style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} />
      <button onClick={generateReply} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Generate Reply</button>
      <pre style={{ marginTop: '2rem' }}>{response}</pre>
    </div>
  );
}