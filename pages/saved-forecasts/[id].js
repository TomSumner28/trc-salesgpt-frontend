import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSavedForecasts } from '../../lib/useSavedForecasts';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function formatCurrency(n, code) {
  const symbol = CURRENCY_SYMBOLS[code] || '';
  return (
    symbol +
    Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function ViewForecast() {
  const router = useRouter();
  const { id } = router.query;
  const [forecasts] = useSavedForecasts();
  const resultsRef = useRef(null);

  if (!router.isReady || forecasts.length === 0) {
    return (
      <main className="container">
        <p>Loading...</p>
      </main>
    );
  }

  const forecast = forecasts.find((f) => f.id === Number(id));
  if (!forecast) {
    return (
      <main className="container">
        <p>Forecast not found.</p>
        <Link href="/saved-forecasts">Back</Link>
      </main>
    );
  }

  const { type, retailer, publisher, manager, rep, results = {} } = forecast;
  const monthLabels = results.monthLabels ||
    (results.monthly ? results.monthly.map((_, i) => `Month ${i + 1}`) : []);
  const [view,setView] = useState('global');
  const [theme,setTheme] = useState('light');
  useEffect(()=>{document.documentElement.dataset.theme = theme;},[theme]);

  const downloadPdf = async () => {
    if (!resultsRef.current) return;
    const viewToggle = resultsRef.current.querySelector('.view-toggle');
    const prevView = viewToggle ? viewToggle.style.display : '';
    if (viewToggle) viewToggle.style.display = 'none';
    const canvas = await html2canvas(resultsRef.current);
    if (viewToggle) viewToggle.style.display = prevView;
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
    const fileName = retailer
      ? `${retailer}-forecast.pdf`
      : 'forecast.pdf';
    pdf.save(fileName);
  };

  const editPath =
    type === 'publisher'
      ? `/publisher-forecast?edit=${forecast.id}`
      : `/?edit=${forecast.id}`;

  const GlobalView = () => {
    const total = results.total || {};
    return (
    <table className="summary-table">
      <tbody>
        {publisher && (
          <tr>
            <th>Publisher</th>
            <td>{publisher}</td>
          </tr>
        )}
        <tr>
          <th>Transaction Count</th>
          <td>{formatNumber(Math.round(total.orders || 0))}</td>
        </tr>
        <tr>
          <th>Revenue</th>
          <td>{formatCurrency(total.revenue, results.currency || forecast.currency)}</td>
        </tr>
        <tr>
          <th>Total Cashback</th>
          <td>{formatCurrency(total.cashback, results.currency || forecast.currency)}</td>
        </tr>
        {results.cashbackRates && (
          (() => {
            const ex = results.cashbackRates.existing || 0;
            const nw = results.cashbackRates.new || 0;
            if (ex > 0 && nw > 0) {
              return (
                <>
                  <tr><th>New Customer Total Cashback</th><td>{nw}%</td></tr>
                  <tr><th>Existing Customer Total Cashback</th><td>{ex}%</td></tr>
                </>
              );
            }
            const rate = ex > 0 ? ex : nw;
            return rate ? (<tr><th>Total Cashback</th><td>{rate}%</td></tr>) : null;
          })()
        )}
        <tr>
          <th>Net Revenue</th>
          <td>{formatCurrency(total.netRevenue, results.currency || forecast.currency)}</td>
        </tr>
        {total.aov && (
          <tr>
            <th>Average Order Value</th>
            <td>{formatCurrency(total.aov, results.currency || forecast.currency)}</td>
          </tr>
        )}
        {forecast.inputs?.otherDetails && (
          <tr>
            <th>Other Offer Details</th>
            <td>{forecast.inputs.otherDetails}</td>
          </tr>
        )}
        <tr>
          <th>ROAS</th>
          <td>{(total.roas || 0).toFixed(2)}x</td>
        </tr>
      </tbody>
    </table>
  );
  };

  const OfferView = () => (
    results.offerBreakdown && (
      <table className="monthly-table">
        <thead>
          <tr>
            <th>{type === 'publisher' ? 'Type' : 'Type'}</th>
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
              <td>{formatCurrency(d.revenue, results.currency || forecast.currency)}</td>
              <td>{formatCurrency(d.cashback, results.currency || forecast.currency)}</td>
              <td>{formatCurrency(d.netRevenue, results.currency || forecast.currency)}</td>
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
              <td>{formatCurrency(d.revenue, results.currency || forecast.currency)}</td>
              <td>{formatCurrency(d.cashback, results.currency || forecast.currency)}</td>
              <td>{formatCurrency(d.netRevenue, results.currency || forecast.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  return (
    <>
      <Head>
        <title>Saved Forecast</title>
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
        <h1>Saved Forecast</h1>
        <div className="view-toggle">
          <select value={view} onChange={e=>setView(e.target.value)}>
            <option value="global">High Level Campaign Metrics</option>
            {results.offerBreakdown && <option value="offer">By Offer Type</option>}
            {results.channelBreakdown && <option value="channel">By Channel</option>}
            <option value="all">View All</option>
          </select>
          <button type="button" onClick={() => router.push(editPath)}>
            Edit Forecast
          </button>
          <button type="button" onClick={downloadPdf}>Download PDF</button>
        </div>
        <div className="results" ref={resultsRef}>
          <h2>
            {retailer ? `${retailer} - ${forecast.inputs?.forecastLength || monthLabels.length} Month Forecast` : 'Forecast'}
          </h2>
          {view==='global' && <GlobalView />}
          {view==='offer' && <OfferView />}
          {view==='channel' && <ChannelView />}
          {view==='all' && (
            <div className="side-by-side">
              <div>
                <h3>High Level Campaign Metrics</h3>
                <GlobalView />
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
          {results.monthly && (
            <>
              <h3>Monthly Projection</h3>
              <table className="monthly-table">
                <thead>
                  <tr>
                    <th></th>
                    {monthLabels.map((m, i) => (
                      <th key={i}>{m}</th>
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
                          (v) =>
                            formatCurrency(
                              v,
                              results.currency || forecast.currency
                            )
                        )}
                        {makeRow(
                          'Total Cashback',
                          results.monthly.map((m) => m.cashback),
                          (v) =>
                            formatCurrency(
                              v,
                              results.currency || forecast.currency
                            )
                        )}
                  {makeRow(
                          'Net Revenue',
                          results.monthly.map((m) => m.netRevenue),
                          (v) =>
                            formatCurrency(
                              v,
                              results.currency || forecast.currency
                            )
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </>
          )}
          <p className="disclaimer">
            <strong>Disclaimer:</strong><br />
            All forecasts are based on historical performance data and may fluctuate depending on a range of variables. These figures are intended as directional guidance rather than fixed budgets, offering insight into the potential success of your campaign with The Reward Collection.<br /><br />
            We’re looking forward to getting this campaign up and running with {publisher} and continuing to build on our partnership.<br /><br />
            Thanks,<br />
            {(manager || rep).charAt(0).toUpperCase() + (manager || rep).slice(1)}<br />
            {(manager || rep)}@thewardcollection.com
          </p>
        </div>
      </main>
    </>
  );
}
