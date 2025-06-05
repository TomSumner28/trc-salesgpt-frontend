
import React from 'react';

export default function Home() {
  const handleMicrosoftConnect = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/start`);
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Failed to initiate Microsoft auth:", error);
    }
  };

  return (
    <main style={{ padding: "4rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome to TRC SalesGPT</h1>
      <button onClick={handleMicrosoftConnect} style={{ marginTop: "2rem", padding: "1rem 2rem", fontSize: "1rem" }}>
        Connect Microsoft
      </button>
    </main>
  );
}
