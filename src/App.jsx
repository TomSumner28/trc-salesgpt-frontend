import React from 'react';
import { MicrosoftLoginButton } from './MicrosoftLoginButton';

export default function App() {
  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">TRC SalesGPT</h1>
        <MicrosoftLoginButton />
      </div>
    </div>
  );
}
