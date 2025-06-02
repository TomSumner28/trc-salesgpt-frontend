
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  useEffect(() => {
    document.title = "TRC SalesGPT";
  }, []);

  const handleMicrosoftLogin = () => {
    window.location.href =
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize" +
      `?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=https://trc-salesgpt-backend.onrender.com/callback` +
      `&response_mode=query` +
      `&scope=offline_access user.read mail.read mail.send` +
      `&state=12345`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-400">TRC SalesGPT</h1>
        <Button onClick={handleMicrosoftLogin}>Login with Microsoft</Button>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow">
        <Card className="w-full max-w-xl p-6 bg-gray-900 border border-gray-700">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
            <p className="text-gray-400">Coming soon...</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
