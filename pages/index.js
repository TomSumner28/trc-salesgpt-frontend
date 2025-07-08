import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [retailer, setRetailer] = useState('');
  const [tier, setTier] = useState('1');
  const [aov, setAov] = useState(0);
  const [region, setRegion] = useState('UK');
  const [cashback, setCashback] = useState(10);
  const [results, setResults] = useState(null);

  const REGIONAL_REACH = {
    UK: 500000,
    US: 1000000,
    EU: 750000,
    APAC: 300000,
  };

  const TIER_MULTIPLIERS = {
    1: 0.10,
    2: 0.05,
    3: 0.02,
  };

  const handleSubmit = () => {
    const reach = REGIONAL_REACH[region];
    const conversionRate = TIER_MULTIPLIERS[tier];
    const expectedSales = reach * conversionRate;
    const expectedRevenue = expectedSales * aov;
    const cashbackCost = expectedRevenue * (cashback / 100);
    const roas = cashbackCost ? expectedRevenue / cashbackCost : 0;

    setResults({
      expectedSales,
      expectedRevenue,
      cashbackCost,
      roas
    });
  };

  return (
    <div>
      <Head>
        <title>Forecasting GPT</title>
      </Head>
      <main>
        <h1>Forecasting GPT</h1>
        <input placeholder="Retailer Name" value={retailer} onChange={e => setRetailer(e.target.value)} />
        <select value={tier} onChange={e => setTier(e.target.value)}>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <input type="number" placeholder="Average Order Value (£)" value={aov} onChange={e => setAov(Number(e.target.value))} />
        <select value={region} onChange={e => setRegion(e.target.value)}>
          <option>UK</option>
          <option>US</option>
          <option>EU</option>
          <option>APAC</option>
        </select>
        <input type="range" min="0" max="100" value={cashback} onChange={e => setCashback(Number(e.target.value))} />
        <span>{cashback}% Cashback</span>
        <button onClick={handleSubmit}>Generate Forecast</button>

        {results && (
          <div>
            <h2>Forecast Results</h2>
            <p><strong>Expected Sales:</strong> {results.expectedSales.toLocaleString()}</p>
            <p><strong>Expected Revenue:</strong> £{results.expectedRevenue.toFixed(2)}</p>
            <p><strong>Cashback Cost:</strong> £{results.cashbackCost.toFixed(2)}</p>
            <p><strong>ROAS:</strong> {results.roas.toFixed(2)}x</p>
          </div>
        )}
      </main>
    </div>
  );
}