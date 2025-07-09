import { useState } from 'react';
import Head from 'next/head';

const REACH_BY_REGION = {
  'North America': 100000,
  'Europe': 80000,
  'Asia': 120000,
};

const MULTIPLIER_BY_TIER = {
  1: 1.2,
  2: 1.0,
  3: 0.8,
};

export default function Forecast() {
  const [retailer, setRetailer] = useState('');
  const [tier, setTier] = useState('1');
  const [aov, setAov] = useState('');
  const [region, setRegion] = useState('North America');
  const [cashback, setCashback] = useState('');
  const [results, setResults] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const reach = REACH_BY_REGION[region] ?? 0;
    const multiplier = MULTIPLIER_BY_TIER[tier] ?? 1;
    const expectedOrders = (reach / 1000) * multiplier;
    const revenue = expectedOrders * (parseFloat(aov) || 0);
    const adSpend = revenue * ((parseFloat(cashback) || 0) / 100);
    const roas = adSpend ? revenue / adSpend : 0;
    setResults({ expectedOrders, revenue, adSpend, roas });
  };

  return (
    <>
      <Head>
        <title>Forecasting</title>
      </Head>
      <main style={{ padding: '40px' }}>
        <h1>Forecasting GPT</h1>
        <form onSubmit={calculate} style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: '10px' }}>
            <label>Retailer Name:</label>
            <input
              type="text"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Tier:</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Average Order Value:</label>
            <input
              type="number"
              value={aov}
              onChange={(e) => setAov(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Region:</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              {Object.keys(REACH_BY_REGION).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Cashback %:</label>
            <input
              type="number"
              value={cashback}
              onChange={(e) => setCashback(e.target.value)}
            />
          </div>
          <button type="submit">Calculate</button>
        </form>
        {results && (
          <div style={{ marginTop: '20px' }}>
            <h2>Results</h2>
            <p>Expected Orders: {results.expectedOrders.toFixed(0)}</p>
            <p>Revenue: ${results.revenue.toFixed(2)}</p>
            <p>Ad Spend: ${results.adSpend.toFixed(2)}</p>
            <p>ROAS: {results.roas.toFixed(2)}x</p>
          </div>
        )}
      </main>
    </>
  );
}
