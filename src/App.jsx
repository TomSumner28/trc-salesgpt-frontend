import React from "react";
import MicrosoftLoginButton from "./MicrosoftLoginButton";

function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">TRC SalesGPT</h1>
        <MicrosoftLoginButton />
      </div>
    </div>
  );
}

export default App;