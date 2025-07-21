import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePublishers } from '../lib/usePublishers';

export default function Publishers() {
  const [publishers] = usePublishers();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <> 
      <Head>
        <title>Publishers</title>
      </Head>
      <main className="container">
        <div className="top-bar">
          <div className="nav-links">
            <Link href="/">Forecasting</Link>
            <Link href="/publishers">Publishers</Link>
            <Link href="/publisher-forecast">Publisher Forecasts</Link>
            <Link href="/saved-forecasts">Saved Forecasts</Link>
          </div>
          <div className="theme-switch">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
        <h1>Publishers</h1>
        <table className="monthly-table">
          <thead>
            <tr>
              <th>Network Publishers</th>
              <th>Sub Publishers</th>
              <th>Status</th>
              <th>Regions</th>
              <th>Reach</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((p) => (
              <tr key={p.id}>
                <td>{p.network}</td>
                <td>{p.sub}</td>
                <td>{p.status}</td>
                <td>{Array.isArray(p.regions) ? p.regions.join(', ') : p.regions}</td>
                <td>{p.reach ? p.reach.toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
