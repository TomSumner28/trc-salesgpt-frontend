import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePublishers, computeReach } from '../lib/usePublishers';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const REGIONS = ['UK', 'US', 'EU'];
const SALES_REPS = ['james', 'lucy', 'rebecca', 'ryan', 'preena', 'shamas', 'shaun'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTH_CHANGES = {
  January: -0.2,
  February: 0.05,
  March: 0.05,
  April: 0.07,
  May: -0.02,
  June: 0.03,
  July: 0.06,
  August: 0.08,
  September: 0.04,
  October: 0.05,
  November: 0.1,
  December: 0.1,
};

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

function computeMonthlyShares(baseShares, weights) {
  const adjusted = baseShares.map((s, i) => s * (weights[i] || 1));
  const sum = adjusted.reduce((a, b) => a + b, 0) || 1;
  return adjusted.map((s) => s / sum);
}


export default function Forecast() {
  const [retailer, setRetailer] = useState('');
  const [rep, setRep] = useState(SALES_REPS[0]);
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
  const [startMonth, setStartMonth] = useState(MONTHS[0]);
  const [theme, setTheme] = useState('light');
  const [baseShares, setBaseShares] = useState([]);
  const [weights, setWeights] = useState(Array(6).fill(1));
  const resultsRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const newOnly =
      parseFloat(cashbackNew) > 0 && (!cashbackExisting || parseFloat(cashbackExisting) === 0);
    const obj = {};
    regions.forEach((r) => {
      const baseReach = computeReach(publishers, r, newOnly);
      obj[r] = Math.round(baseReach * 0.5);
    });
    setReach(obj);
  }, [regions, cashbackExisting, cashbackNew, publishers]);

  useEffect(() => {
    if (!results || baseShares.length === 0) return;
    const aovNum = parseFloat(aov) || 0;
    const existingCb = parseFloat(cashbackExisting) || 0;
    const newCb = parseFloat(cashbackNew) || 0;
    const hasExisting = existingCb > 0;
    const hasNew = newCb > 0;
    const exRatio = hasExisting && hasNew ? 0.6 : hasNew && !hasExisting ? 0 : 1;
    const nwRatio = hasExisting && hasNew ? 0.4 : hasNew && !hasExisting ? 1 : 0;
    const shares = computeMonthlyShares(baseShares, weights);
    const monthly = shares.map((s) => {
      const monthOrders = results.total.orders * s;
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
    setResults((prev) => ({ ...prev, monthly }));
  }, [weights]);

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
          <th>Increase in Basket Spend</th>
          <td>28%</td>
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

  const ChannelView = () => (
    results.channelBreakdown && (
      <table className="monthly-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Total Cashback</th>
            <th>Net Revenue</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results.channelBreakdown).map(([c, d]) => (
            <tr key={c}>
              <td>{c}</td>
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

  const updateWeight = (index, value) => {
    setWeights((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const calculate = (e) => {
    e.preventDefault();

    const storeCount = parseInt(stores, 10) || 0;
    const baseConversion = CONVERSION_BY_TIER[tier] || 0;
    const storeUplift = instore && storeCount > 0 ? storeCount * 0.000001 : 0;
    const conversion = baseConversion + storeUplift;

    const aovNum = parseFloat(aov) || 0;
    const existingCb = parseFloat(cashbackExisting) || 0;
    const newCb = parseFloat(cashbackNew) || 0;

    const perRegion = {};
    let totalOrders = 0;
    let onlineOrdersTotal = 0;
    let instoreOrdersTotal = 0;
    regions.forEach((r) => {
      const regionReach = parseInt(reach[r], 10) || 0;
      let onlineOrders = 0;
      let instoreOrders = 0;
      if (online && instore) {
        onlineOrders = regionReach * baseConversion;
        instoreOrders = regionReach * storeUplift;
      } else if (instore && !online) {
        instoreOrders = regionReach * conversion;
      } else {
        onlineOrders = regionReach * baseConversion;
      }
      const orders = onlineOrders + instoreOrders;
      perRegion[r] = { orders };
      totalOrders += orders;
      onlineOrdersTotal += onlineOrders;
      instoreOrdersTotal += instoreOrders;
    });

    let existingOrders = 0;
    let newOrders = 0;

    const hasExisting = existingCb > 0;
    const hasNew = newCb > 0;

    const computeAmounts = (orders) => {
      const exRatio = hasExisting && hasNew ? 0.6 : hasNew && !hasExisting ? 0 : 1;
      const nwRatio = hasExisting && hasNew ? 0.4 : hasNew && !hasExisting ? 1 : 0;
      const revenue = orders * aovNum;
      const cashback =
        orders * aovNum * ((existingCb * exRatio + newCb * nwRatio) / 100);
      return {
        orders,
        revenue,
        cashback,
        netRevenue: revenue - cashback,
      };
    };

    if (hasExisting && hasNew) {
      existingOrders = totalOrders * 0.6;
      newOrders = totalOrders * 0.4;
    } else if (hasNew && !hasExisting) {
      newOrders = totalOrders * 0.4;
      totalOrders = newOrders;
    } else {
      existingOrders = totalOrders;
    }

    const channelBreakdown =
      online && instore
        ? {
            online: computeAmounts(onlineOrdersTotal),
            instore: computeAmounts(instoreOrdersTotal),
          }
        : null;

    const { revenue, cashback: cashbackAmount, netRevenue } =
      computeAmounts(totalOrders);
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

    const startIndex = MONTHS.indexOf(startMonth);
    const monthLabels = [];
    const deltas = [];
    for (let i = 0; i < 6; i++) {
      const idx = (startIndex + i) % MONTHS.length;
      const m = MONTHS[idx];
      monthLabels.push(m);
      deltas.push(MONTH_CHANGES[m] || 0);
    }

    const factors = [];
    factors[0] = 1 + deltas[0];
    for (let i = 1; i < 6; i++) {
      factors[i] = factors[i - 1] * (1 + deltas[i]);
    }
    const sumFactors = factors.reduce((a, b) => a + b, 0);
    const shares = factors.map((f) => f / sumFactors);
    setBaseShares(shares);
    setWeights(Array(6).fill(1));
    const adjShares = computeMonthlyShares(shares, Array(6).fill(1));
    const monthly = adjShares.map((s) => {
      const monthOrders = totalOrders * s;
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
      monthLabels,
      offerBreakdown,
      channelBreakdown,
      currency,
    });
  };

  const downloadPdf = async () => {
    if (!resultsRef.current) return;
    const sliderRow = resultsRef.current.querySelector('.slider-row');
    const prevDisplay = sliderRow ? sliderRow.style.display : '';
    if (sliderRow) sliderRow.style.display = 'none';
    const canvas = await html2canvas(resultsRef.current);
    if (sliderRow) sliderRow.style.display = prevDisplay;
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
              Sales Rep
              <select value={rep} onChange={(e) => setRep(e.target.value)}>
                {SALES_REPS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Retailer Name
              <input
                type="text"
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                required
              />
            </label>
            <label className="full-width">
              Starting Month
              <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
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
          <div className="results">
            <div className="view-toggle">
              <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="global">High Level Campaign Metrics</option>
                <option value="region">By Region</option>
                {results.offerBreakdown && (
                  <option value="offer">By Offer Type</option>
                )}
                {results.channelBreakdown && (
                  <option value="channel">By Channel</option>
                )}
                <option value="all">View All</option>
              </select>
              <button type="button" onClick={downloadPdf}>Download PDF</button>
            </div>
            <div ref={resultsRef}>
            <h2>{retailer ? `${retailer} 6-Month Forecast` : '6-Month Forecast'}</h2>
            {view === 'global' && <GlobalView />}
            {view === 'region' && <RegionView />}
            {view === 'offer' && <OfferView />}
            {view === 'channel' && <ChannelView />}
            {view === 'all' && (
              <div className="side-by-side">
                <div>
                  <h3>High Level Campaign Metrics</h3>
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
                {results.channelBreakdown && (
                  <div>
                    <h3>By Channel</h3>
                    <ChannelView />
                  </div>
                )}
              </div>
            )}

            <h3>Monthly Projection</h3>
            <table className="monthly-table">
              <thead>
                <tr>
                  <th></th>
                  {results.monthLabels.map((m, i) => (
                    <th key={i}>{m}</th>
                  ))}
                  <th>Total</th>
                </tr>
                <tr className="slider-row">
                  <th>Adjust</th>
                  {weights.map((w, i) => (
                    <th key={i}>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.01"
                        value={w}
                        onChange={(e) => updateWeight(i, parseFloat(e.target.value))}
                      />
                    </th>
                  ))}
                  <th></th>
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
            <p className="disclaimer">
              <strong>Disclaimer:</strong>
              <br />
              The projections outlined in this forecast are based on historical sales data and are influenced by a range of dynamic variables. While they offer a directional view of potential performance, they should not be considered fixed budgets or guaranteed outcomes. The Reward Collection provides these insights to help guide strategic planning and campaign alignment.
              <br />
              <br />
              We look forward to continuing our discussions and exploring the opportunities ahead.
              <br />
              <br />
              Warm regards,
              <br />
              {rep.charAt(0).toUpperCase() + rep.slice(1)}
              <br />
              {rep}@thewardcollection.com
            </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
