
import Head from 'next/head';

export default function Home() {
  const handleConnect = async () => {
    window.location.href = 'https://trc-salesgpt-backend.onrender.com/auth/start';
  };

  return (
    <div style={{ padding: '40px' }}>
      <Head>
        <title>TRC SalesGPT</title>
        <meta name="description" content="Connect Microsoft Account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 style={{ fontSize: '2.5rem' }}>Welcome to TRC SalesGPT</h1>
      <button onClick={handleConnect}>Connect Microsoft</button>
    </div>
  );
}
