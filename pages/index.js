import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [metrics, setMetrics] = useState({});

  const handleConnect = async () => {
    // Redirect to your Microsoft OAuth flow
    window.location.href = 'https://trc-salesgpt-backend.onrender.com/auth/start';
  };

  useEffect(() => {
    // Placeholder for fetching messages from Microsoft Graph API
    const dummyEmails = [
      { sender: 'alice@example.com', responseTimeDays: 1 },
      { sender: 'bob@example.com', responseTimeDays: 2 },
      { sender: 'alice@example.com', responseTimeDays: 3 }
    ];
    setEmails(dummyEmails);
  }, []);

  useEffect(() => {
    // Compute simple metrics using dummy data
    const counts = {};
    let totalResponse = 0;
    emails.forEach((e) => {
      counts[e.sender] = (counts[e.sender] || 0) + 1;
      totalResponse += e.responseTimeDays;
    });
    const avgResponse = emails.length ? (totalResponse / emails.length).toFixed(2) : 0;
    setMetrics({ counts, avgResponse });
  }, [emails]);

  return (
    <div className={styles.container}>
      <Head>
        <title>TRC SalesGPT Dashboard</title>
      </Head>
      <Header onConnect={handleConnect} />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <h2>Email Metrics</h2>
          <pre>{JSON.stringify(metrics, null, 2)}</pre>
        </main>
      </div>
    </div>
  );
}
