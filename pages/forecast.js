import { useState } from 'react';
import Head from 'next/head';

const REACH_BY_REGION = {
  UK: 50000,
  US: 120000,
  EU: 80000,
};

const CONVERSION_BY_TIER = {
  1: 0.05,
  2: 0.04,
  3: 0.03,
  4: 0.025,
  5: 0.02,
  6: 0.015,
};

export default function Forecast() {
  const [retailer, setRetailer] = useState('');
  const [regions, setRegions] = useState(['UK']);
  const [tier, setTier] = useState('1');
  const [online, setOnline] = useState(false);
  const [instore, setInstore] = useState(false);
  const [stores, setStores] = useState('');
  const [aov, setAov] = useState('');
  const [cashbackExisting, setCashbackExisting] = useState('');
  const [cashbackNew, setCashbackNew] = useState('');
  const [results, setResults] = useState(null);

  const handleRegionChange = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setRegions(opts);
  };

  const calculate = (e) => {
    e.preventDefault();
    const reach = regions.reduce((acc, r) => acc + (REACH_BY_REGION[r] || 0), 0);
    let conversion = CONVERSION_BY_TIER[tier] || 0;

    const storeCount = parseInt(stores, 10) || 0;
    if (instore && storeCount > 0) {
      conversion += storeCount * 0.00001;
    }

    let expectedOrders = reach * conversion;
    const aovNum = parseFloat(aov) || 0;
    const existingCb = parseFloat(cashbackExisting) || 0;
    const newCb = parseFloat(cashbackNew) || 0;

    let existingOrders = 0;
    let newOrders = 0;

    const hasExisting = existingCb > 0;
    const hasNew = newCb > 0;

    if (hasExisting && hasNew) {
      existingOrders = expectedOrders * 0.6;
      newOrders = expectedOrders * 0.4;
    } else if (hasNew && !hasExisting) {
      newOrders = expectedOrders * 0.4;
      expectedOrders = newOrders;
    } else {
      existingOrders = expectedOrders;
    }

    const revenue = expectedOrders * aovNum;
    const adSpend =
      existingOrders * aovNum * (existingCb / 100) +
      newOrders * aovNum * (newCb / 100);
    const roas = adSpend ? revenue / adSpend : 0;

    setResults({ expectedOrders, revenue, adSpend, roas });
  };

  return (
    <>
      <Head>
        <title>Forecasting GPT</title>
      </Head>
      <main className="container">
        <h1>Forecasting GPT</h1>
        <form onSubmit={calculate} className="form">
          <label>
            Retailer Name
            <input
              type="text"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              required
            />
          </label>
          <label>
            Regions
            <select multiple value={regions} onChange={handleRegionChange}>
              {Object.keys(REACH_BY_REGION).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tier
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>
                  Tier {t}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={online}
              onChange={(e) => setOnline(e.target.checked)}
            />
            Online
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={instore}
              onChange={(e) => setInstore(e.target.checked)}
            />
            In-store
          </label>
          {instore && (
            <label>
              Number of Stores
              <input
                type="number"
                value={stores}
                onChange={(e) => setStores(e.target.value)}
                min="0"
              />
            </label>
          )}
          <label>
            Average Order Value
            <input
              type="number"
              value={aov}
              onChange={(e) => setAov(e.target.value)}
            />
          </label>
          <label>
            Cashback Existing %
            <input
              type="number"
              value={cashbackExisting}
              onChange={(e) => setCashbackExisting(e.target.value)}
            />
          </label>
          <label>
            Cashback New %
            <input
              type="number"
              value={cashbackNew}
              onChange={(e) => setCashbackNew(e.target.value)}
            />
          </label>
          <button type="submit">Calculate Forecast</button>
        </form>
        {results && (
          <div className="results">
            <h2>Results</h2>
            <p>Expected Orders: {results.expectedOrders.toFixed(0)}</p>
            <p>Revenue: £{results.revenue.toFixed(2)}</p>
            <p>Ad Spend: £{results.adSpend.toFixed(2)}</p>
            <p>ROAS: {results.roas.toFixed(2)}x</p>
          </div>
        )}
      </main>
    </>
  );
}
