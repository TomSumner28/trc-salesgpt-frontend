import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MANAGERS = ['tayla', 'laura'];
const MONTHS = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
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

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function formatNumber(n) {
  return n.toLocaleString();
}

function formatCurrency(n, code) {
  const symbol = CURRENCY_SYMBOLS[code] || '';
  return (
    symbol + n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})
  );
}

function computeMonthlyShares(baseShares, weights) {
  const adjusted = baseShares.map((s,i)=>s*(weights[i]||1));
  const sum = adjusted.reduce((a,b)=>a+b,0) || 1;
  return adjusted.map(s=>s/sum);
}

export default function PublisherForecast() {
  const [manager,setManager] = useState(MANAGERS[0]);
  const [publisher,setPublisher] = useState('');
  const [retailer,setRetailer] = useState('');
  const [currency,setCurrency] = useState('GBP');
  const [forecastLength,setForecastLength] = useState('6');
  const [startMonth,setStartMonth] = useState(MONTHS[0]);
  const [mode,setMode] = useState('always');
  const [allTx,setAllTx] = useState('');
  const [allRevenue,setAllRevenue] = useState('');
  const [allCashback,setAllCashback] = useState('');
  const [existingTx,setExistingTx] = useState('');
  const [existingRevenue,setExistingRevenue] = useState('');
  const [existingCashback,setExistingCashback] = useState('');
  const [newTx,setNewTx] = useState('');
  const [newRevenue,setNewRevenue] = useState('');
  const [newCashback,setNewCashback] = useState('');
  const [results,setResults] = useState(null);
  const [view,setView] = useState('global');
  const [theme,setTheme] = useState('light');
  const [baseShares,setBaseShares] = useState([]);
  const [weights,setWeights] = useState([]);
  const resultsRef = useRef(null);

  useEffect(()=>{document.documentElement.dataset.theme = theme;},[theme]);

  useEffect(()=>{
    if(!results || baseShares.length===0) return;
    const orders = results.total.orders;
    const revenue = results.total.revenue;
    const cashback = results.total.cashback;
    const shares = computeMonthlyShares(baseShares,weights);
    const monthly = shares.map(s=>({
      orders: orders*s,
      revenue: revenue*s,
      cashback: cashback*s,
      netRevenue: revenue*s - cashback*s,
    }));
    setResults(prev=>({...prev,monthly}));
  },[weights]);

  const updateWeight = (idx,val)=>{
    setWeights(prev=>{const next=[...prev]; next[idx]=val; return next;});
  };

  const calculate=(e)=>{
    e.preventDefault();

    let orders=0;
    let revenue=0;
    let cashback=0;
    let offerBreakdown=null;

    if(mode==='always'){
      orders = parseInt(allTx,10)||0;
      revenue = parseFloat(allRevenue)||0;
      const cbPct = parseFloat(allCashback)||0;
      cashback = revenue * (cbPct/100);
    }else{
      const exOrders = parseInt(existingTx,10)||0;
      const nwOrders = parseInt(newTx,10)||0;
      const exRev = parseFloat(existingRevenue)||0;
      const nwRev = parseFloat(newRevenue)||0;
      const exPct = parseFloat(existingCashback)||0;
      const nwPct = parseFloat(newCashback)||0;
      const exCb = exRev * (exPct/100);
      const nwCb = nwRev * (nwPct/100);
      orders = exOrders + nwOrders;
      revenue = exRev + nwRev;
      cashback = exCb + nwCb;
      offerBreakdown={
        existing:{orders:exOrders,revenue:exRev,cashback:exCb,netRevenue:exRev-exCb},
        new:{orders:nwOrders,revenue:nwRev,cashback:nwCb,netRevenue:nwRev-nwCb}
      };
    }
    const netRevenue = revenue - cashback;
    const roas = cashback? revenue/cashback : 0;
    const aov = orders? revenue/orders : 0;

    const length=parseInt(forecastLength,10)||6;
    const startIdx=MONTHS.indexOf(startMonth);
    const monthLabels=[]; const deltas=[];
    for(let i=0;i<length;i++){
      const idx=(startIdx+i)%MONTHS.length;
      const m=MONTHS[idx];
      monthLabels.push(m);
      deltas.push(MONTH_CHANGES[m]||0);
    }
    const factors=[]; factors[0]=1+deltas[0];
    for(let i=1;i<length;i++){factors[i]=factors[i-1]*(1+deltas[i]);}
    const sumFactors=factors.reduce((a,b)=>a+b,0);
    const shares=factors.map(f=>f/sumFactors);
    setBaseShares(shares); setWeights(Array(length).fill(1));
    const monthly=shares.map(s=>({orders:orders*s,revenue:revenue*s,cashback:cashback*s,netRevenue:revenue*s-cashback*s}));
    setResults({
      total:{orders,revenue,cashback,netRevenue,roas,aov},
      monthLabels,
      monthly,
      offerBreakdown,
      manager,
      currency,
      publisher
    });
  };

  const downloadPdf = async () => {
    if(!resultsRef.current) return;
    const table = resultsRef.current.cloneNode(true);
    table.querySelectorAll('.view-toggle').forEach(el=>el.style.display='none');
    const canvas = await html2canvas(table);
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation:'portrait', unit:'px', format:'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(img,'PNG',0,0,pageWidth,pageHeight);
    pdf.save(`${retailer||'forecast'}-publisher-forecast.pdf`);
  };

  const GlobalView = () => (
    <table className="summary-table">
      <tbody>
        <tr><th>Publisher</th><td>{publisher}</td></tr>
        <tr><th>Transactions</th><td>{formatNumber(Math.round(results.total.orders))}</td></tr>
        <tr><th>Revenue</th><td>{formatCurrency(results.total.revenue,currency)}</td></tr>
        <tr><th>Total Cashback</th><td>{formatCurrency(results.total.cashback,currency)}</td></tr>
        <tr><th>Net Revenue</th><td>{formatCurrency(results.total.netRevenue,currency)}</td></tr>
        <tr><th>Average Order Value</th><td>{formatCurrency(results.total.aov,currency)}</td></tr>
        <tr><th>ROAS</th><td>{results.total.roas.toFixed(2)}x</td></tr>
      </tbody>
    </table>
  );

  return (
    <>
      <Head><title>Publisher Forecasts</title></Head>
      <main className="container">
        <div className="top-bar">
          <Link href="/">Forecasting</Link>
          <Link href="/publishers" style={{ marginLeft:'20px' }}>Publishers</Link>
          <Link href="/publisher-forecast" style={{ marginLeft:'20px' }}>Publisher Forecasts</Link>
          <div className="theme-switch">
            <button type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'?'Light Mode':'Dark Mode'}
            </button>
          </div>
        </div>
        <h1>Publisher Forecasts</h1>
        <form onSubmit={calculate} className="form">
          <label className="full-width">Account Manager
            <select value={manager} onChange={e=>setManager(e.target.value)}>
              {MANAGERS.map(m=>(
                <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>
              ))}
            </select>
          </label>
          <label className="full-width">Publisher Name
            <input value={publisher} onChange={e=>setPublisher(e.target.value)} required />
          </label>
          <label className="full-width">Retailer Name
            <input value={retailer} onChange={e=>setRetailer(e.target.value)} required />
          </label>
          <label>Currency
            <select value={currency} onChange={e=>setCurrency(e.target.value)}>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label>Forecast Length
            <select value={forecastLength} onChange={e=>setForecastLength(e.target.value)}>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </select>
          </label>
          <label>Starting Month
            <select value={startMonth} onChange={e=>setStartMonth(e.target.value)}>
              {MONTHS.map(m=>(<option key={m} value={m}>{m}</option>))}
            </select>
          </label>

          {mode==='always' ? (
            <>
              <label className="full-width">All Transactions
                <input type="number" value={allTx} onChange={e=>setAllTx(e.target.value)} />
              </label>
              <label className="full-width">All Transactions Revenue
                <input type="number" value={allRevenue} onChange={e=>setAllRevenue(e.target.value)} />
              </label>
              <label className="full-width">All Transactions Cashback %
                <input type="number" value={allCashback} onChange={e=>setAllCashback(e.target.value)} />
              </label>
            </>
          ) : (
            <>
              <label className="full-width">Existing Transactions
                <input type="number" value={existingTx} onChange={e=>setExistingTx(e.target.value)} />
              </label>
              <label className="full-width">Existing Customer Revenue
                <input type="number" value={existingRevenue} onChange={e=>setExistingRevenue(e.target.value)} />
              </label>
              <label className="full-width">Existing Cashback %
                <input type="number" value={existingCashback} onChange={e=>setExistingCashback(e.target.value)} />
              </label>
              <label className="full-width">New Transactions
                <input type="number" value={newTx} onChange={e=>setNewTx(e.target.value)} />
              </label>
              <label className="full-width">New Customer Revenue
                <input type="number" value={newRevenue} onChange={e=>setNewRevenue(e.target.value)} />
              </label>
              <label className="full-width">New Cashback %
                <input type="number" value={newCashback} onChange={e=>setNewCashback(e.target.value)} />
              </label>
            </>
          )}
          <div className="checkbox-row full-width">
            <label className="checkbox">
              <input type="radio" name="mode" value="always" checked={mode==='always'} onChange={e=>setMode(e.target.value)} /> Always-on
            </label>
            <label className="checkbox">
              <input type="radio" name="mode" value="tactical" checked={mode==='tactical'} onChange={e=>setMode(e.target.value)} /> Tactical
            </label>
          </div>
          <button type="submit" className="full-width">Calculate Forecast</button>
        </form>
        {results && (
          <div className="results" ref={resultsRef}>
            <div className="view-toggle">
              <select value={view} onChange={e=>setView(e.target.value)}>
                <option value="global">High Level Campaign Metrics</option>
                <option value="all">View All</option>
              </select>
              <button type="button" onClick={downloadPdf}>Download PDF</button>
            </div>
            <h2>{retailer ? `${retailer} Forecast` : 'Forecast'}</h2>
            {view==='global' && <GlobalView />}
            {view==='all' && <GlobalView />}
            <h3>Monthly Projection</h3>
            <table className="monthly-table">
              <thead>
                <tr>
                  <th></th>
                  {results.monthLabels.map((m,i)=>(<th key={i}>{m}</th>))}
                  <th>Total</th>
                </tr>
                <tr className="slider-row">
                  <th>Adjust</th>
                  {weights.map((w,i)=>(<th key={i}><input type="range" min="0.5" max="1.5" step="0.01" value={w} onChange={e=>updateWeight(i,parseFloat(e.target.value))} /></th>))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(()=>{
                  const makeRow=(label,arr,fmt)=>{const tot=arr.reduce((a,b)=>a+b,0);return (<tr><td>{label}</td>{arr.map((v,i)=>(<td key={i}>{fmt(v)}</td>))}<td>{fmt(tot)}</td></tr>);};
                  return (
                    <>
                      {makeRow('Transactions',results.monthly.map(m=>m.orders),v=>formatNumber(Math.round(v)))}
                      {makeRow('Revenue',results.monthly.map(m=>m.revenue),v=>formatCurrency(v,currency))}
                      {makeRow('Total Cashback',results.monthly.map(m=>m.cashback),v=>formatCurrency(v,currency))}
                      {makeRow('Net Revenue',results.monthly.map(m=>m.netRevenue),v=>formatCurrency(v,currency))}
                    </>
                  );
                })()}
              </tbody>
            </table>
            <p className="disclaimer">
              <strong>Disclaimer:</strong><br />
              All forecasts are based on historic sales data and can vary based on a number of variables. These forecasts should not be used as an exact budget but more as a gauge of the success of a campaign with The Reward Collection. We're looking forward to advancing our conversations.<br /><br />
              Thanks,<br />
              {manager.charAt(0).toUpperCase()+manager.slice(1)}<br />
              {manager}@thewardcollection.com
            </p>
          </div>
        )}
      </main>
    </>
  );
}
