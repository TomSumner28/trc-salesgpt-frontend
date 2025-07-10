import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePublishers, computeReach } from '../lib/usePublishers';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const REGIONS = ['UK', 'US', 'EU'];

// Conversion rates by tier. Reduced by 50% from the previous values so
// forecasts are more conservative.
const CONVERSION_BY_TIER = {
  1: 0.0005,
  2: 0.00025,
  3: 0.000125,
  4: 0.0000625,
  5: 0.0000425,
  6: 0.000025,
};

const MONTH_DELTAS = [0, 0.05, 0.07, -0.02, 0.06, 0.04];


function formatNumber(n) {
  return n.toLocaleString();
}

const REGION_CURRENCIES = {
  UK: 'GBP',
  US: 'USD',
  EU: 'EUR',
};

const CURRENCY_SYMBOLS = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

function formatCurrency(n, code) {
  const symbol = CURRENCY_SYMBOLS[code] || '';
  return (
    symbol +
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
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
  const [publishers] = usePublishers();
  const [cashbackExisting, setCashbackExisting] = useState('');
  const [cashbackNew, setCashbackNew] = useState('');
  const [results, setResults] = useState(null);
  const [view, setView] = useState('global');
  const [theme, setTheme] = useState('light');
  const resultsRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const includeNew = parseFloat(cashbackNew) > 0;
    const obj = {};
    regions.forEach((r) => {
      obj[r] = computeReach(publishers, r, includeNew);
    });
    setReach(obj);
  }, [regions, cashbackNew, publishers]);

  const GlobalView = () => (
    <table className="summary-table">
      <tbody>
        <tr>
          <th>Expected Orders</th>
          <td>{formatNumber(Math.round(results.total.orders))}</td>
        </tr>
        <tr>
          <th>Revenue</th>
          <td>
            {formatCurrency(results.total.revenue, results.currency)}
          </td>
        </tr>
        <tr>
          <th>Total Cashback</th>
          <td>
            {formatCurrency(results.total.cashback, results.currency)}
          </td>
        </tr>
        <tr>
          <th>Net Revenue</th>
          <td>
            {formatCurrency(results.total.netRevenue, results.currency)}
          </td>
        </tr>
        <tr>
          <th>ROAS</th>
          <td>{results.total.roas.toFixed(2)}x</td>
        </tr>
      </tbody>
    </table>
  );

  const RegionView = () => (
    <table className="monthly-table">
      <thead>
        <tr>
          <th>Region</th>
          <th>Orders</th>
          <th>Revenue</th>
          <th>Total Cashback</th>
          <th>Net Revenue</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(results.perRegion).map(([r, d]) => (
          <tr key={r}>
            <td>
              {r} ({CURRENCY_SYMBOLS[REGION_CURRENCIES[r]]})
            </td>
            <td>{formatNumber(Math.round(d.orders))}</td>
            <td>{formatCurrency(d.revenue, REGION_CURRENCIES[r])}</td>
            <td>{formatCurrency(d.cashback, REGION_CURRENCIES[r])}</td>
            <td>{formatCurrency(d.netRevenue, REGION_CURRENCIES[r])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const OfferView = () => (
    results.offerBreakdown && (
      <table className="monthly-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Total Cashback</th>
            <th>Net Revenue</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results.offerBreakdown).map(([t, d]) => (
            <tr key={t}>
              <td>{t}</td>
              <td>{formatNumber(Math.round(d.orders))}</td>
              <td>{formatCurrency(d.revenue, results.currency)}</td>
              <td>{formatCurrency(d.cashback, results.currency)}</td>
              <td>{formatCurrency(d.netRevenue, results.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );


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
      // Reduce uplift per store by 60% from the previous 0.00001 value
      conversion += storeCount * 0.000004;
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
    const cashbackAmount =
      existingOrders * aovNum * (existingCb / 100) +
      newOrders * aovNum * (newCb / 100);
    const netRevenue = revenue - cashbackAmount;
    const roas = cashbackAmount ? revenue / cashbackAmount : 0;

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
      const cashbackAmount =
        ex * aovNum * (existingCb / 100) + nw * aovNum * (newCb / 100);
      perRegion[r] = {
        orders,
        revenue: rev,
        cashback: cashbackAmount,
        netRevenue: rev - cashbackAmount,
      };
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
      const monthCashback =
        monthOrders * aovNum * ((existingCb * exRatio + newCb * nwRatio) / 100);
      return {
        orders: monthOrders,
        revenue: monthRevenue,
        cashback: monthCashback,
        netRevenue: monthRevenue - monthCashback,
      };
    });

    const offerBreakdown =
      hasExisting && hasNew
        ? {
            existing: {
              orders: existingOrders,
              revenue: existingOrders * aovNum,
              cashback: existingOrders * aovNum * (existingCb / 100),
              netRevenue:
                existingOrders * aovNum -
                existingOrders * aovNum * (existingCb / 100),
            },
            new: {
              orders: newOrders,
              revenue: newOrders * aovNum,
              cashback: newOrders * aovNum * (newCb / 100),
              netRevenue: newOrders * aovNum - newOrders * aovNum * (newCb / 100),
            },
          }
        : null;

    let bestRegion = regions[0];
    let maxOrders = perRegion[bestRegion]?.orders || 0;
    regions.forEach((r) => {
      if ((perRegion[r]?.orders || 0) > maxOrders) {
        bestRegion = r;
        maxOrders = perRegion[r].orders;
      }
    });
    const currency = REGION_CURRENCIES[bestRegion] || 'GBP';

    setResults({
      total: {
        orders: totalOrders,
        revenue,
        cashback: cashbackAmount,
        netRevenue,
        roas,
      },
      perRegion,
      monthly,
      offerBreakdown,
      currency,
    });
  };

  const downloadPdf = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    let heightLeft = imgHeight - pdf.internal.pageSize.getHeight();
    while (heightLeft > 0) {
      position -= pdf.internal.pageSize.getHeight();
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    const fileName = retailer ? `${retailer}-6-month-forecast.pdf` : '6-month-forecast.pdf';
    pdf.save(fileName);
  };

  return (
    <>
      <Head>
        <title>The Reward Collection Forecasting Tool</title>
      </Head>
      <main className="container">
        <div className="top-bar">
          <Link href="/publishers">Publishers</Link>
          <div className="theme-switch">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
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
                  type="text"
                  value={reach[r] ? formatNumber(reach[r]) : ''}
                  onChange={(e) =>
                    setReach((curr) => ({
                      ...curr,
                      [r]: parseInt(e.target.value.replace(/,/g, ''), 10) || 0,
                    }))
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
          <div className="results" ref={resultsRef}>
            <h2>{retailer ? `${retailer} 6-Month Forecast` : '6-Month Forecast'}</h2>
            <div className="view-toggle">
              <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="global">Global</option>
                <option value="region">By Region</option>
                {results.offerBreakdown && (
                  <option value="offer">By Offer Type</option>
                )}
                <option value="all">View All</option>
              </select>
              <button type="button" onClick={downloadPdf}>Download PDF</button>
            </div>
            {view === 'global' && <GlobalView />}
            {view === 'region' && <RegionView />}
            {view === 'offer' && <OfferView />}
            {view === 'all' && (
              <div className="side-by-side">
                <div>
                  <h3>Global</h3>
                  <GlobalView />
                </div>
                <div>
                  <h3>By Region</h3>
                  <RegionView />
                </div>
                {results.offerBreakdown && (
                  <div>
                    <h3>By Offer Type</h3>
                    <OfferView />
                  </div>
                )}
              </div>
            )}

            <h3>Monthly Projection</h3>
            <table className="monthly-table">
              <thead>
                <tr>
                  <th></th>
                  {results.monthly.map((_, i) => (
                    <th key={i}>{`Month ${i + 1}`}</th>
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
                        (v) => formatCurrency(v, results.currency)
                      )}
                      {makeRow(
                        'Total Cashback',
                        results.monthly.map((m) => m.cashback),
                        (v) => formatCurrency(v, results.currency)
                      )}
                      {makeRow(
                        'Net Revenue',
                        results.monthly.map((m) => m.netRevenue),
                        (v) => formatCurrency(v, results.currency)
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
