import React, { useState } from "react";

export default function QuickResponse() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/api/salesgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div>
      <h3>Quick Response</h3>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} style={{ width: "100%", marginBottom: "1rem" }} />
      <br />
      <button onClick={handleSubmit}>Generate Reply</button>
      {response && <pre style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>{response}</pre>}
    </div>
  );
}
