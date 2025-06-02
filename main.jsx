import React from "react";
import ReactDOM from "react-dom/client";
import MicrosoftLoginButton from "./MicrosoftLoginButton.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-600">TRC SalesGPT Interface</h1>
        <MicrosoftLoginButton />
      </div>
    </div>
  </React.StrictMode>
);
