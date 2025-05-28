import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [query, setQuery] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("https://trc-salesgpt-backend.onrender.com/api/salesgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResponse(data.reply);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>TRC SalesGPT</h1>
      <textarea rows={5} cols={50} value={query} onChange={e => setQuery(e.target.value)} />
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Thinking...' : 'Generate Response'}
      </button>
      <div style={{ marginTop: 20 }}>
        <strong>Response:</strong>
        <pre>{response}</pre>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
