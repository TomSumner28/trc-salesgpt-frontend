import { useState } from 'react';
import Head from 'next/head';

const REGIONS = {
  UK: { reach: 5000000, currency: 'GBP' },
  US: { reach: 10000000, currency: 'USD' },
  EU: { reach: 8000000, currency: 'EUR' },
};

const CONVERSION = { 1: 0.001, 2: 0.0005, 3: 0.00025 };

function formatNumber(n) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatCurrency(n, code) {
  const symbols = { GBP: '£', USD: '$', EUR: '€' };
  return (
    symbols[code] +
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export default function Home() {
  const [retailer, setRetailer] = useState('');
  const [tier, setTier] = useState('1');
  const [regions, setRegions] = useState([]);
  const [aov, setAov] = useState('');
  const [cashback, setCashback] = useState('');
  const [result, setResult] = useState(null);

  const toggleRegion = (r) => {
    setRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const calculate = (e) => {
    e.preventDefault();
    if (regions.length === 0) return;
    const reach = regions.reduce((sum, r) => sum + REGIONS[r].reach, 0);
    const conv = CONVERSION[tier] || 0;
    const orders = reach * conv;
    const revenue = orders * (parseFloat(aov) || 0);
    const cashbackCost = revenue * ((parseFloat(cashback) || 0) / 100);
    const roas = cashbackCost ? revenue / cashbackCost : 0;
    const mainCurrency = REGIONS[regions[0]].currency;
    setResult({ reach, orders, revenue, cashbackCost, roas, currency: mainCurrency });
  };

  return (
    <div className="container">
      <Head>
        <title>The Reward Collection Forecasting GPT</title>
      </Head>
      <h1>The Reward Collection Forecasting GPT</h1>
      <form onSubmit={calculate} className="form">
        <label className="full-width">
          Retailer Name
          <input value={retailer} onChange={(e) => setRetailer(e.target.value)} required />
        </label>
        <label>
          Tier
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label>
          Average Order Value
          <input
            type="number"
            value={aov}
            onChange={(e) => setAov(e.target.value)}
            required
          />
        </label>
        <fieldset className="region-group full-width">
          <legend>Regions</legend>
          {Object.keys(REGIONS).map((r) => (
            <label key={r} className="checkbox">
              <input
                type="checkbox"
                checked={regions.includes(r)}
                onChange={() => toggleRegion(r)}
              />
              {r}
            </label>
          ))}
        </fieldset>
        <label className="full-width">
          % Cashback
          <input
            type="number"
            value={cashback}
            onChange={(e) => setCashback(e.target.value)}
            required
          />
        </label>
        <div className="full-width" style={{ textAlign: 'center' }}>
          <button type="submit">Generate Forecast</button>
        </div>
      </form>
      {result && (
        <div className="results">
          <h2>Forecast for {retailer}</h2>
          <table>
            <tbody>
              <tr>
                <th>Total Reach</th>
                <td>{formatNumber(result.reach)}</td>
              </tr>
              <tr>
                <th>Expected Orders</th>
                <td>{formatNumber(result.orders)}</td>
              </tr>
              <tr>
                <th>Revenue</th>
                <td>{formatCurrency(result.revenue, result.currency)}</td>
              </tr>
              <tr>
                <th>Total Cashback</th>
                <td>{formatCurrency(result.cashbackCost, result.currency)}</td>
              </tr>
              <tr>
                <th>ROAS</th>
                <td>{result.roas.toFixed(2)}x</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
