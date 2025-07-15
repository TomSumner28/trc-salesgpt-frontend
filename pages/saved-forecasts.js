import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSavedForecasts } from '../lib/useSavedForecasts';

export default function SavedForecasts() {
  const [forecasts, , removeForecast] = useSavedForecasts();
  const [theme,setTheme] = useState('light');
  useEffect(()=>{document.documentElement.dataset.theme = theme;},[theme]);
  return (
    <>
      <Head>
        <title>Saved Forecasts</title>
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
            <button type="button" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'?'Light Mode':'Dark Mode'}
            </button>
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
              {forecasts.map((f) => (
                <tr key={f.id}>
                  <td>
                    <a className="row-link" href={`/saved-forecasts/${f.id}`}>{f.retailer || f.publisher || 'Forecast'}</a>
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
