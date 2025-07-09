import { useState, useEffect } from 'react';
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

const MONTH_DELTAS = [0, 0.05, 0.07, -0.02, 0.06, 0.04];

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const CHART_PADDING = 40;

function formatNumber(n) {
  return n.toLocaleString();
}

function formatCurrency(n, usd) {
  const symbol = usd ? '$' : '£';
  return symbol + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  const [theme, setTheme] = useState('dark');
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);


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

    const factors = [1];
    for (let i = 1; i < MONTH_DELTAS.length; i++) {
      factors[i] = factors[i - 1] * (1 + MONTH_DELTAS[i]);
    }
    const sumFactors = factors.reduce((a, b) => a + b, 0);
    const monthly = factors.map((f) => {
      const monthOrders = (totalOrders * f) / sumFactors;
      const exRatio = hasExisting && hasNew ? 0.6 : hasNew && !hasExisting ? 0 : 1;
      const nwRatio = hasExisting && hasNew ? 0.4 : hasNew && !hasExisting ? 1 : 0;
      const monthRevenue = monthOrders * aovNum;
      const monthAdSpend =
        monthOrders * aovNum * ((existingCb * exRatio + newCb * nwRatio) / 100);
      return { orders: monthOrders, revenue: monthRevenue, adSpend: monthAdSpend };
    });

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

    const isUSD = regions.length === 1 && regions[0] === 'US';

    setResults({
      total: { orders: totalOrders, revenue, adSpend, roas },
      perRegion,
      monthly,
      offerBreakdown,
      currency: isUSD ? 'USD' : 'GBP',
    });
  };

  return (
    <>
      <Head>
        <title>The Reward Collection Forecasting Tool</title>
      </Head>
      <main className="container">
        <div className="theme-switch">
          <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <h1>The Reward Collection Forecasting Tool</h1>
        <p style={{ textAlign: 'center' }}>
          Enter campaign details below to estimate performance.
        </p>
          <form onSubmit={calculate} className="form">
            <label className="full-width">
              Retailer Name
              <input
                type="text"
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                required
              />
            </label>
            <fieldset className="region-group full-width">
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
            <div className="checkbox-row">
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
            </div>
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
          <button type="submit" className="full-width">Calculate Forecast</button>
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
                <p>
                  Expected Orders:{' '}
                  {formatNumber(Math.round(results.total.orders))}
                </p>
                <p>
                  Revenue:{' '}
                  {formatCurrency(
                    results.total.revenue,
                    results.currency === 'USD'
                  )}
                </p>
                <p>
                  Ad Spend:{' '}
                  {formatCurrency(
                    results.total.adSpend,
                    results.currency === 'USD'
                  )}
                </p>
                <p>ROAS: {results.total.roas.toFixed(2)}x</p>
              </>
            )}
            {view === 'region' && (
              <table className="monthly-table">
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
                      <td>{formatNumber(Math.round(d.orders))}</td>
                      <td>
                        {formatCurrency(
                          d.revenue,
                          results.currency === 'USD'
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          d.adSpend,
                          results.currency === 'USD'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {view === 'offer' && results.offerBreakdown && (
              <table className="monthly-table">
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
                      <td>{formatNumber(Math.round(d.orders))}</td>
                      <td>
                        {formatCurrency(
                          d.revenue,
                          results.currency === 'USD'
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          d.adSpend,
                          results.currency === 'USD'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3>Monthly Projection</h3>
            <table className="monthly-table">
              <thead>
                <tr>
                  <th></th>
                  {results.monthly.map((_, i) => (
                    <th key={i}>{`M${i + 1}`}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const makeRow = (label, arr, formatter) => {
                    const total = arr.reduce((a, b) => a + b, 0);
                    return (
                      <tr>
                        <td>{label}</td>
                        {arr.map((v, i) => (
                          <td key={i}>{formatter(v)}</td>
                        ))}
                        <td>{formatter(total)}</td>
                      </tr>
                    );
                  };
                  return (
                    <>
                      {makeRow(
                        'Orders',
                        results.monthly.map((m) => m.orders),
                        (v) => formatNumber(Math.round(v))
                      )}
                      {makeRow(
                        'Revenue',
                        results.monthly.map((m) => m.revenue),
                        (v) => formatCurrency(v, results.currency === 'USD')
                      )}
                      {makeRow(
                        'Ad Spend',
                        results.monthly.map((m) => m.adSpend),
                        (v) => formatCurrency(v, results.currency === 'USD')
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
            <svg
              viewBox={`0 0 ${CHART_WIDTH + CHART_PADDING + 20} ${CHART_HEIGHT + 40}`}
              className="chart"
              preserveAspectRatio="none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - CHART_PADDING;
                const idx = Math.round((x / CHART_WIDTH) * (results.monthly.length - 1));
                if (idx >= 0 && idx < results.monthly.length) {
                  setHoverIdx(idx);
                } else {
                  setHoverIdx(null);
                }
              }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {(() => {
                const revMax = Math.max(...results.monthly.map((m) => m.revenue));
                const spendMax = Math.max(...results.monthly.map((m) => m.adSpend));
                const aovCalc = results.total.orders > 0 ? results.total.revenue / results.total.orders : 0;
                const orderMax = Math.max(...results.monthly.map((m) => m.orders * aovCalc));
                const max = Math.max(revMax, spendMax, orderMax);
                const pointsFor = (data) =>
                  data.map((v, idx) => {
                    const x = CHART_PADDING + (idx / (data.length - 1)) * CHART_WIDTH;
                    const y = CHART_HEIGHT - (v / max) * (CHART_HEIGHT - 20) + 10;
                    return { x, y };
                  });
                const revPts = pointsFor(results.monthly.map((m) => m.revenue));
                const spendPts = pointsFor(results.monthly.map((m) => m.adSpend));
                const orderPts = pointsFor(results.monthly.map((m) => m.orders * aovCalc));
                const pathFrom = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                const ticks = 4;
                const pt = hoverIdx != null ? revPts[hoverIdx] : null;
                return (
                  <>
                    <line x1={CHART_PADDING} y1={CHART_HEIGHT} x2={CHART_PADDING + CHART_WIDTH} y2={CHART_HEIGHT} stroke="#555" />
                    <line x1={CHART_PADDING} y1={10} x2={CHART_PADDING} y2={CHART_HEIGHT} stroke="#555" />
                    {Array.from({ length: ticks + 1 }, (_, i) => {
                      const val = (max * i) / ticks;
                      const y = CHART_HEIGHT - (val / max) * (CHART_HEIGHT - 20) + 10;
                      return (
                        <g key={i}>
                          <line x1={CHART_PADDING - 4} y1={y} x2={CHART_PADDING} y2={y} stroke="#555" />
                          <text x={0} y={y + 4} fontSize="10" fill="#aaa">
                            {formatCurrency(val, results.currency === 'USD')}
                          </text>
                        </g>
                      );
                    })}
                    {results.monthly.map((_, idx) => {
                      const x = CHART_PADDING + (idx / (results.monthly.length - 1)) * CHART_WIDTH;
                      return (
                        <text key={idx} x={x} y={CHART_HEIGHT + 15} textAnchor="middle" fontSize="10" fill="#aaa">
                          {`M${idx + 1}`}
                        </text>
                      );
                    })}
                    <path d={pathFrom(revPts)} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    <path d={pathFrom(spendPts)} fill="none" stroke="#888" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    <path d={pathFrom(orderPts)} fill="none" stroke="#2aa4c9" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    {hoverIdx != null && (
                      <g>
                        <line x1={pt.x} x2={pt.x} y1={10} y2={CHART_HEIGHT} stroke="#555" strokeDasharray="4" />
                        <circle cx={revPts[hoverIdx].x} cy={revPts[hoverIdx].y} r="4" fill="var(--brand)" />
                        <circle cx={spendPts[hoverIdx].x} cy={spendPts[hoverIdx].y} r="4" fill="#888" />
                        <circle cx={orderPts[hoverIdx].x} cy={orderPts[hoverIdx].y} r="4" fill="#2aa4c9" />
                        <text x={pt.x} y={20} textAnchor="middle" fontSize="10" fill="#aaa">
                          {formatCurrency(results.monthly[hoverIdx].revenue, results.currency === 'USD')}
                        </text>
                        <text x={pt.x} y={32} textAnchor="middle" fontSize="10" fill="#aaa">
                          {formatCurrency(results.monthly[hoverIdx].adSpend, results.currency === 'USD')}
                        </text>
                        <text x={pt.x} y={44} textAnchor="middle" fontSize="10" fill="#aaa">
                          {formatNumber(Math.round(results.monthly[hoverIdx].orders))} orders
                        </text>
                      </g>
                    )}
                  </>
                );
              })()}
            </svg>
            <div className="chart-legend">
              <span><span className="line revenue"></span>Revenue</span>
              <span><span className="line spend"></span>Ad Spend</span>
              <span><span className="line orders"></span>Sales</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
