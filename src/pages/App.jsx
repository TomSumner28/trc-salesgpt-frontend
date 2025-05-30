import React from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-900 p-4 text-xl font-bold">TRC SalesGPT</header>
      <main className="flex flex-1">
        <aside className="w-64 bg-gray-800 p-4">Sidebar</aside>
        <section className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
          <div className="bg-gray-700 p-4 rounded-lg shadow">Main Content Area</div>
        </section>
      </main>
    </div>
  );
}