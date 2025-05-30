import { useState } from "react";

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectOutlook = async () => {
    try {
      window.location.href = "https://trc-salesgpt-backend.onrender.com/auth/microsoft";
    } catch (err) {
      console.error("Error initiating Microsoft OAuth:", err);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <aside className="w-64 bg-[#0f0f0f] p-4 border-r border-gray-800">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#2f9bff]">TRC SalesGPT</h1>
        </div>
        <nav className="flex flex-col space-y-4">
          <button className="text-left text-white hover:text-[#2f9bff]">Dashboard</button>
          <button className="text-left text-white hover:text-[#2f9bff]">Team</button>
          <button className="text-left text-white hover:text-[#2f9bff]">Knowledge Base</button>
          <button className="text-left text-white hover:text-[#2f9bff]">Quick Response</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <button
            onClick={handleConnectOutlook}
            className="bg-[#2f9bff] px-4 py-2 rounded hover:bg-blue-700"
          >
            {isConnected ? "Connected" : "Link Microsoft"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1f1f1f] p-4 rounded shadow">
            <p className="text-sm text-gray-400">Emails sent</p>
            <p className="text-2xl font-bold">248</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded shadow">
            <p className="text-sm text-gray-400">Avg. reply time</p>
            <p className="text-2xl font-bold">4.2h</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded shadow">
            <p className="text-sm text-gray-400">Reply rate</p>
            <p className="text-2xl font-bold">33%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1f1f1f] p-4 rounded shadow h-40">
            <p className="text-lg mb-2">Emails Sent Over Time</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded shadow h-40">
            <p className="text-lg mb-2">Reply Rate by Team Member</p>
          </div>
        </div>
      </main>
    </div>
  );
}