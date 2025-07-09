import { useState } from 'react';
import Head from 'next/head';

const REGIONS = ['UK', 'US', 'EU'];

const CONVERSION_BY_TIER = {
  1: 0.001,
  2: 0.0005,
  3: 0.00025,
  4: 0.000125,
  5: 0.000085,
  6: 0.00005,
};

export default function Forecast() {
  const [retailer, setRetailer] = useState('');
  const [regions, setRegions] = useState([]);
  const [tier, setTier] = useState('1');
  const [online, setOnline] = useState(false);
  const [instore, setInstore] = useState(false);
  const [stores, setStores] = useState('');
  const [aov, setAov] = useState('');
  const [reach, setReach] = useState({});
  const [cashbackExisting, setCashbackExisting] = useState('');
  const [cashbackNew, setCashbackNew] = useState('');
  const [results, setResults] = useState(null);
  const [view, setView] = useState('global');

  const toggleRegion = (region) => {
    setRegions((prev) => {
      if (prev.includes(region)) {
        const updated = prev.filter((r) => r !== region);
        setReach((curr) => {
          const copy = { ...curr };
          delete copy[region];
          return copy;
        });
        return updated;
      }
      setReach((curr) => ({ ...curr, [region]: '' }));
      return [...prev, region];
    });
  };

  const calculate = (e) => {
    e.preventDefault();

    const storeCount = parseInt(stores, 10) || 0;
    let conversion = CONVERSION_BY_TIER[tier] || 0;
    if (instore && storeCount > 0) {
      conversion += storeCount * 0.00001;
    }

    const aovNum = parseFloat(aov) || 0;
    const existingCb = parseFloat(cashbackExisting) || 0;
    const newCb = parseFloat(cashbackNew) || 0;

    const perRegion = {};
    let totalOrders = 0;
    regions.forEach((r) => {
      const regionReach = parseInt(reach[r], 10) || 0;
      const orders = regionReach * conversion;
      perRegion[r] = { orders };
      totalOrders += orders;
    });

    let existingOrders = 0;
    let newOrders = 0;

    const hasExisting = existingCb > 0;
    const hasNew = newCb > 0;

    if (hasExisting && hasNew) {
      existingOrders = totalOrders * 0.6;
      newOrders = totalOrders * 0.4;
    } else if (hasNew && !hasExisting) {
      newOrders = totalOrders * 0.4;
      totalOrders = newOrders;
    } else {
      existingOrders = totalOrders;
    }

    const revenue = totalOrders * aovNum;
    const adSpend =
      existingOrders * aovNum * (existingCb / 100) +
      newOrders * aovNum * (newCb / 100);
    const roas = adSpend ? revenue / adSpend : 0;

    Object.keys(perRegion).forEach((r) => {
      const orders = perRegion[r].orders;
      let ex = 0;
      let nw = 0;
      if (hasExisting && hasNew) {
        ex = orders * 0.6;
        nw = orders * 0.4;
      } else if (hasNew && !hasExisting) {
        nw = orders * 0.4;
      } else {
        ex = orders;
      }
      const rev = orders * aovNum;
      const spend =
        ex * aovNum * (existingCb / 100) + nw * aovNum * (newCb / 100);
      perRegion[r] = { orders, revenue: rev, adSpend: spend };
    });

    const monthly = Array.from({ length: 6 }).map(() => ({
      orders: totalOrders / 6,
      revenue: revenue / 6,
      adSpend: adSpend / 6,
    }));

    const offerBreakdown =
      hasExisting && hasNew
        ? {
            existing: {
              orders: existingOrders,
              revenue: existingOrders * aovNum,
              adSpend: existingOrders * aovNum * (existingCb / 100),
            },
            new: {
              orders: newOrders,
              revenue: newOrders * aovNum,
              adSpend: newOrders * aovNum * (newCb / 100),
            },
          }
        : null;

    setResults({
      total: { orders: totalOrders, revenue, adSpend, roas },
      perRegion,
      monthly,
      offerBreakdown,
    });
  };

  return (
    <>
      <Head>
        <title>Forecasting GPT</title>
      </Head>
      <main className="container">
        <h1>Forecasting GPT</h1>
        <p style={{ textAlign: 'center' }}>
          Enter campaign details below to estimate performance.
        </p>
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
          <fieldset className="region-group">
            <legend>Regions</legend>
            {REGIONS.map((r) => (
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
          {regions.map((r) => (
            <label key={`reach-${r}`} className="reach-input">
              Reach {r}
              <input
                type="number"
                value={reach[r] || ''}
                onChange={(e) =>
                  setReach((curr) => ({ ...curr, [r]: e.target.value }))
                }
              />
            </label>
          ))}
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
            <div className="view-toggle">
              <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="global">Global</option>
                <option value="region">By Region</option>
                {results.offerBreakdown && (
                  <option value="offer">By Offer Type</option>
                )}
              </select>
            </div>
            {view === 'global' && (
              <>
                <p>Expected Orders: {results.total.orders.toFixed(0)}</p>
                <p>Revenue: £{results.total.revenue.toFixed(2)}</p>
                <p>Ad Spend: £{results.total.adSpend.toFixed(2)}</p>
                <p>ROAS: {results.total.roas.toFixed(2)}x</p>
              </>
            )}
            {view === 'region' && (
              <table>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Ad Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.perRegion).map(([r, d]) => (
                    <tr key={r}>
                      <td>{r}</td>
                      <td>{d.orders.toFixed(0)}</td>
                      <td>£{d.revenue.toFixed(2)}</td>
                      <td>£{d.adSpend.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {view === 'offer' && results.offerBreakdown && (
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Ad Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.offerBreakdown).map(([t, d]) => (
                    <tr key={t}>
                      <td>{t}</td>
                      <td>{d.orders.toFixed(0)}</td>
                      <td>£{d.revenue.toFixed(2)}</td>
                      <td>£{d.adSpend.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3>Monthly Projection</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Ad Spend</th>
                </tr>
              </thead>
              <tbody>
                {results.monthly.map((m, i) => (
                  <tr key={i}>
                    <td>{`Month ${i + 1}`}</td>
                    <td>{m.orders.toFixed(0)}</td>
                    <td>£{m.revenue.toFixed(2)}</td>
                    <td>£{m.adSpend.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
