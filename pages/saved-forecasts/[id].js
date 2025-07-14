import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSavedForecasts } from '../../lib/useSavedForecasts';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function formatNumber(n) {
  return n.toLocaleString();
}

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

export default function ViewForecast() {
  const router = useRouter();
  const { id } = router.query;
  const [forecasts] = useSavedForecasts();
  const forecast = forecasts.find((f) => f.id === Number(id));
  const resultsRef = useRef(null);

  if (!forecast) {
    return (
      <main className="container">
        <p>Forecast not found.</p>
        <Link href="/saved-forecasts">Back</Link>
      </main>
    );
  }

  const { type, retailer, publisher, manager, rep, results } = forecast;

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

  const GlobalView = () => (
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
          <td>{formatNumber(Math.round(results.total.orders))}</td>
        </tr>
        <tr>
          <th>Revenue</th>
          <td>{formatCurrency(results.total.revenue, results.currency || forecast.currency)}</td>
        </tr>
        <tr>
          <th>Total Cashback</th>
          <td>{formatCurrency(results.total.cashback, results.currency || forecast.currency)}</td>
        </tr>
        {results.cashbackRates && (
          <>
            {results.cashbackRates.new > 0 && (
              <tr>
                <th>New Customer Total Cashback</th>
                <td>{results.cashbackRates.new}%</td>
              </tr>
            )}
            {results.cashbackRates.existing > 0 && (
              <tr>
                <th>Existing Customer Total Cashback</th>
                <td>{results.cashbackRates.existing}%</td>
              </tr>
            )}
          </>
        )}
        <tr>
          <th>Net Revenue</th>
          <td>{formatCurrency(results.total.netRevenue, results.currency || forecast.currency)}</td>
        </tr>
        {results.total.aov && (
          <tr>
            <th>Average Order Value</th>
            <td>{formatCurrency(results.total.aov, results.currency || forecast.currency)}</td>
          </tr>
        )}
        <tr>
          <th>ROAS</th>
          <td>{results.total.roas.toFixed(2)}x</td>
        </tr>
      </tbody>
    </table>
  );

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
          <Link href="/">Forecasting</Link>
          <Link href="/publishers" style={{ marginLeft: '20px' }}>
            Publishers
          </Link>
          <Link href="/publisher-forecast" style={{ marginLeft: '20px' }}>
            Publisher Forecasts
          </Link>
          <Link href="/saved-forecasts" style={{ marginLeft: '20px' }}>
            Saved Forecasts
          </Link>
        </div>
        <h1>Saved Forecast</h1>
        <div className="view-toggle">
          <button type="button" onClick={() => router.push(editPath)}>
            Edit Forecast
          </button>
          <button type="button" onClick={downloadPdf}>Download PDF</button>
        </div>
        <div ref={resultsRef}>
          <h2>
            {retailer ? `${retailer} Forecast` : 'Forecast'}
          </h2>
          <GlobalView />
          {OfferView()}
          {ChannelView()}
          {results.monthly && (
            <>
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
        </div>
      </main>
    </>
  );
}
