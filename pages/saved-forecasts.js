import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSavedForecasts } from '../lib/useSavedForecasts';

export default function SavedForecasts() {
  const [forecasts, , removeForecast] = useSavedForecasts();
  const [query,setQuery] = useState('');
  const [theme,setTheme] = useState('light');
  useEffect(()=>{document.documentElement.dataset.theme = theme;},[theme]);
  const filtered = forecasts.filter(f =>
    (f.retailer || f.publisher || '').toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <Head>
        <title>Saved Forecasts</title>
      </Head>
      <main className="container">
        <div className="top-bar">
          <Link href="/">Forecasting</Link>
          <Link href="/publishers" style={{ marginLeft: '20px' }}>Publishers</Link>
          <Link href="/publisher-forecast" style={{ marginLeft: '20px' }}>
            Publisher Forecasts
          </Link>
          <Link href="/saved-forecasts" style={{ marginLeft: '20px' }}>
            Saved Forecasts
          </Link>
          <div className="theme-switch">
            <button type="button" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'?'Light Mode':'Dark Mode'}
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={e=>setQuery(e.target.value)}
            />
          </div>
        </div>
        <h1>Saved Forecasts</h1>
        {forecasts.length === 0 ? (
          <p>No saved forecasts.</p>
        ) : (
          <table className="monthly-table">
            <thead>
              <tr>
                <th>Retailer/Publisher</th>
                <th>Date Saved</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <Link href={`/saved-forecasts/${f.id}`}>
                      {f.retailer || f.publisher || 'Forecast'}
                    </Link>
                  </td>
                  <td>{new Date(f.savedAt).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => removeForecast(f.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
