import React, { useState } from 'react';
import axios from 'axios';

export default function QuickResponse() {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');

  const generateReply = async () => {
    const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/salesgpt', { query });
    setReply(res.data.reply || 'No response');
  };

  return (
    <div>
      <h1>Quick GPT Response</h1>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Paste email text..." rows={6} style={{ width: '100%' }} />
      <button onClick={generateReply} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Generate Reply</button>
      <pre style={{ background: '#1e293b', padding: '1rem', marginTop: '1rem' }}>{reply}</pre>
    </div>
  );
}
