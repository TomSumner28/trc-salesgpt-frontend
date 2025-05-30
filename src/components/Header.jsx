import React from "react";

export default function Header() {
  const handleConnect = () => {
    window.location.href = import.meta.env.VITE_API_BASE_URL + "/login";
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#1e293b",
      padding: "1rem",
      borderBottom: "1px solid #334155"
    }}>
      <h2 style={{ color: "#3b82f6", margin: 0 }}>TRC SalesGPT</h2>
      <button onClick={handleConnect} style={{ background: "#3b82f6", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
        Connect Outlook
      </button>
    </div>
  );
}
