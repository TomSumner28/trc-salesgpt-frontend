import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSavedForecasts } from '../../lib/useSavedForecasts';
import { useState, useEffect } from 'react';

const SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function formatCurrency(n, code) {
  const s = SYMBOLS[code] || '';
  return s + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SavedForecast() {
  const router = useRouter();
  const { id } = router.query;
  const [forecasts] = useSavedForecasts();
  const [theme, setTheme] = useState('dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  if (!router.isReady || !forecasts) {
    return <main className="container"><p>Loading...</p></main>;
  }

  const fc = forecasts.find(f => f.id === Number(id));
  if (!fc) {
    return (
      <main className="container">
        <p>Forecast not found.</p>
        <Link href="/saved-forecasts">Back</Link>
      </main>
    );
  }

  const { retailer, results } = fc;
  return (
    <>
      <Head><title>Saved Forecast</title></Head>
      <main className="container">
        <div className="top-bar">
          <div className="nav-links">
            <Link href="/">Forecast</Link>
            <Link href="/saved-forecasts">Saved Forecasts</Link>
          </div>
          <div className="theme-switch">
            <button type="button" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
        <h1>Saved Forecast</h1>
        <div className="results">
          <h2>{retailer ? `Forecast for ${retailer}` : 'Forecast'}</h2>
          <table>
            <tbody>
              <tr><th>Total Reach</th><td>{formatNumber(results.reach)}</td></tr>
              <tr><th>Expected Orders</th><td>{formatNumber(results.orders)}</td></tr>
              <tr><th>Revenue</th><td>{formatCurrency(results.revenue, results.currency)}</td></tr>
              <tr><th>Total Cashback</th><td>{formatCurrency(results.cashbackCost, results.currency)}</td></tr>
              <tr><th>ROAS</th><td>{results.roas.toFixed(2)}x</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
