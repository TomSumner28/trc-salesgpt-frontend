import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSavedForecasts } from '../lib/useSavedForecasts';

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

const NUM_FORMAT = new Intl.NumberFormat('en-US');

function formatNumber(n) {
  return NUM_FORMAT.format(Number(n || 0));
}

function formatInputValue(v) {
  if (v === '' || v === null || v === undefined) return '';
  const parts = String(v).split('.');
  parts[0] = NUM_FORMAT.format(Number(parts[0].replace(/,/g, '')));
  return parts.join('.');
}

function parseInputValue(v) {
  return v.replace(/[^0-9.]/g, '');
}

function formatCurrency(n, code) {
  const symbol = CURRENCY_SYMBOLS[code] || '';
  return (
    symbol + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
  const [instore,setInstore] = useState(false);
  const [instoreTx,setInstoreTx] = useState('');
  const [instoreRevenue,setInstoreRevenue] = useState('');
  const [allTx,setAllTx] = useState('');
  const [allRevenue,setAllRevenue] = useState('');
  const [allCashback,setAllCashback] = useState('');
  const [existingTx,setExistingTx] = useState('');
  const [existingRevenue,setExistingRevenue] = useState('');
  const [existingCashback,setExistingCashback] = useState('');
  const [newTx,setNewTx] = useState('');
  const [newRevenue,setNewRevenue] = useState('');
  const [newCashback,setNewCashback] = useState('');
  const [otherDetails,setOtherDetails] = useState('');
  const [trcMargin,setTrcMargin] = useState('');
  const [trcMarginExisting,setTrcMarginExisting] = useState('');
  const [trcMarginNew,setTrcMarginNew] = useState('');
  const [results,setResults] = useState(null);
  const [view,setView] = useState('global');
  const [theme,setTheme] = useState('light');
  const [showTrc,setShowTrc] = useState(false);
  const [baseShares,setBaseShares] = useState([]);
  const [weights,setWeights] = useState([]);
  const resultsRef = useRef(null);
  const [forecasts, addSavedForecast] = useSavedForecasts();
  const router = useRouter();

  useEffect(()=>{document.documentElement.dataset.theme = theme;},[theme]);

  useEffect(() => {
    if (!router.query.edit || forecasts.length === 0) return;
    const f = forecasts.find((fc) => fc.id === Number(router.query.edit));
    if (f && f.inputs) {
      const inp = f.inputs;
      setManager(inp.manager || MANAGERS[0]);
      setPublisher(inp.publisher || '');
      setRetailer(inp.retailer || '');
      setCurrency(inp.currency || 'GBP');
      setForecastLength(inp.forecastLength || '6');
      setStartMonth(inp.startMonth || MONTHS[0]);
      setMode(inp.mode || 'always');
      setInstore(!!inp.instore);
      setInstoreTx(inp.instoreTx || '');
      setInstoreRevenue(inp.instoreRevenue || '');
      setAllTx(inp.allTx || '');
      setAllRevenue(inp.allRevenue || '');
      setAllCashback(inp.allCashback || '');
      setExistingTx(inp.existingTx || '');
      setExistingRevenue(inp.existingRevenue || '');
      setExistingCashback(inp.existingCashback || '');
      setNewTx(inp.newTx || '');
      setNewRevenue(inp.newRevenue || '');
      setNewCashback(inp.newCashback || '');
      setOtherDetails(inp.otherDetails || '');
      setTrcMargin(inp.trcMargin || '');
      setTrcMarginExisting(inp.trcMarginExisting || '');
      setTrcMarginNew(inp.trcMarginNew || '');
      if (f.results) setResults(f.results);
    }
  }, [router.query.edit, forecasts]);

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
    const trc = shares.map((s,i)=>{
      if(mode==='always'){
        const m=parseFloat(trcMargin)||0;
        return revenue*s*(m/100);
      }else{
        const exRev=parseFloat(existingRevenue)||0;
        const nwRev=parseFloat(newRevenue)||0;
        const mE=parseFloat(trcMarginExisting)||0;
        const mN=parseFloat(trcMarginNew)||0;
        return exRev*s*(mE/100)+nwRev*s*(mN/100);
      }
    });
    setResults(prev=>({...prev,monthly,trcMonthly:trc,trcRevenue:trc.reduce((a,b)=>a+b,0)}));
  },[weights,trcMargin,trcMarginExisting,trcMarginNew]);

  const updateWeight = (idx,val)=>{
    setWeights(prev=>{const next=[...prev]; next[idx]=val; return next;});
  };

  const calculate=(e)=>{
    e.preventDefault();

    let orders=0;
    let revenue=0;
    let cashback=0;
    let onlineOrders=0, onlineRevenue=0, onlineCashback=0;
    let instOrders=0, instRevenue=0, instCashback=0;
    let offerBreakdown=null;
    let cashbackSplit=null;

    if(mode==='always'){
      onlineOrders = parseInt(allTx,10)||0;
      onlineRevenue = parseFloat(allRevenue)||0;
      const cbPct = parseFloat(allCashback)||0;
      onlineCashback = onlineRevenue * (cbPct/100);
      if(instore){
        instOrders = parseInt(instoreTx,10)||0;
        instRevenue = parseFloat(instoreRevenue)||0;
        instCashback = instRevenue * (cbPct/100);
      }
      orders = onlineOrders + instOrders;
      revenue = onlineRevenue + instRevenue;
      cashback = onlineCashback + instCashback;
    }else{
      const exOrders = parseInt(existingTx,10)||0;
      const nwOrders = parseInt(newTx,10)||0;
      const exRev = parseFloat(existingRevenue)||0;
      const nwRev = parseFloat(newRevenue)||0;
      const exPct = parseFloat(existingCashback)||0;
      const nwPct = parseFloat(newCashback)||0;
      const exCb = exRev * (exPct/100);
      const nwCb = nwRev * (nwPct/100);
      onlineOrders = exOrders + nwOrders;
      onlineRevenue = exRev + nwRev;
      onlineCashback = exCb + nwCb;
      if(instore){
        const avgPct = (exPct + nwPct) / 2;
        instOrders = parseInt(instoreTx,10)||0;
        instRevenue = parseFloat(instoreRevenue)||0;
        instCashback = instRevenue * (avgPct/100);
      }
      orders = onlineOrders + instOrders;
      revenue = onlineRevenue + instRevenue;
      cashback = onlineCashback + instCashback;
      offerBreakdown={
        existing:{orders:exOrders,revenue:exRev,cashback:exCb,netRevenue:exRev-exCb},
        new:{orders:nwOrders,revenue:nwRev,cashback:nwCb,netRevenue:nwRev-nwCb}
      };
      cashbackSplit={existing:exCb,new:nwCb};
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
    let channelBreakdown=null;
    if(instore){
      channelBreakdown={
        online:{orders:onlineOrders,revenue:onlineRevenue,cashback:onlineCashback,netRevenue:onlineRevenue-onlineCashback},
        instore:{orders:instOrders,revenue:instRevenue,cashback:instCashback,netRevenue:instRevenue-instCashback}
      };
    }
    const cashbackRates =
      mode === 'always'
        ? { existing: parseFloat(allCashback) || 0 }
        : {
            existing: parseFloat(existingCashback) || 0,
            new: parseFloat(newCashback) || 0,
          };

    setResults({
      total: { orders, revenue, cashback, netRevenue, roas, aov },
      monthLabels,
      monthly,
      offerBreakdown,
      channelBreakdown,
      cashbackSplit,
      cashbackRates,
      manager,
      currency,
      publisher,
    });
  };

  const downloadPdf = async () => {
    if (!resultsRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');
    const viewToggle = resultsRef.current.querySelector('.view-toggle');
    const sliderRow = resultsRef.current.querySelector('.slider-row');
    const saveBtn = resultsRef.current.querySelector('.save-btn');
    const trcSection = resultsRef.current.querySelector('.trc-section');
    const trcBtn = resultsRef.current.querySelector('.trc-toggle-btn');
    const prevView = viewToggle ? viewToggle.style.display : '';
    const prevSlider = sliderRow ? sliderRow.style.display : '';
    const prevSave = saveBtn ? saveBtn.style.display : '';
    const prevTrc = trcSection ? trcSection.style.display : '';
    const prevTrcBtn = trcBtn ? trcBtn.style.display : '';
    if (viewToggle) viewToggle.style.display = 'none';
    if (sliderRow) sliderRow.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    if (trcSection) trcSection.style.display = 'none';
    if (trcBtn) trcBtn.style.display = 'none';
    const canvas = await html2canvas(resultsRef.current);
    if (viewToggle) viewToggle.style.display = prevView;
    if (sliderRow) sliderRow.style.display = prevSlider;
    if (saveBtn) saveBtn.style.display = prevSave;
    if (trcSection) trcSection.style.display = prevTrc;
    if (trcBtn) trcBtn.style.display = prevTrcBtn;
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
    pdf.save(`${retailer || 'forecast'}-publisher-forecast.pdf`);
  };

  const saveForecast = () => {
    if (!results) return;
    addSavedForecast({
      type: 'publisher',
      retailer,
      publisher,
      manager,
      inputs: {
        manager,
        publisher,
        retailer,
        currency,
        forecastLength,
        startMonth,
        mode,
        instore,
        instoreTx,
        instoreRevenue,
        allTx,
        allRevenue,
        allCashback,
        existingTx,
        existingRevenue,
        existingCashback,
        newTx,
        newRevenue,
        newCashback,
        otherDetails,
        trcMargin,
        trcMarginExisting,
        trcMarginNew,
      },
      results,
    });
    alert('Forecast saved');
  };

  const GlobalView = () => (
    <table className="summary-table">
      <tbody>
        <tr><th>Publisher</th><td>{publisher}</td></tr>
        {(() => {
          const ex = results.cashbackRates?.existing || 0;
          const nw = results.cashbackRates?.new || 0;
          if (ex > 0 && nw > 0) {
            return (
              <>
                <tr><th>New Customer Total Cashback</th><td>{nw}%</td></tr>
                <tr><th>Existing Customer Total Cashback</th><td>{ex}%</td></tr>
              </>
            );
          }
          const rate = ex > 0 ? ex : nw;
          return rate ? (
            <tr><th>Total Cashback</th><td>{rate}%</td></tr>
          ) : null;
        })()}
        {otherDetails && <tr><th>Other Offer Details</th><td>{otherDetails}</td></tr>}
        <tr><th>Transaction Count</th><td>{formatNumber(Math.round(results.total.orders))}</td></tr>
        <tr><th>Revenue</th><td>{formatCurrency(results.total.revenue,currency)}</td></tr>
        <tr><th>Total Cashback</th><td>{formatCurrency(results.total.cashback,currency)}</td></tr>
        <tr><th>Net Revenue</th><td>{formatCurrency(results.total.netRevenue,currency)}</td></tr>
        <tr><th>Average Order Value</th><td>{formatCurrency(results.total.aov,currency)}</td></tr>
        <tr><th>ROAS</th><td>{results.total.roas.toFixed(2)}x</td></tr>
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
          {Object.entries(results.offerBreakdown).map(([t,d])=> (
            <tr key={t}>
              <td>{t}</td>
              <td>{formatNumber(Math.round(d.orders))}</td>
              <td>{formatCurrency(d.revenue,currency)}</td>
              <td>{formatCurrency(d.cashback,currency)}</td>
              <td>{formatCurrency(d.netRevenue,currency)}</td>
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
          {Object.entries(results.channelBreakdown).map(([c,d]) => (
            <tr key={c}>
              <td>{c}</td>
              <td>{formatNumber(Math.round(d.orders))}</td>
              <td>{formatCurrency(d.revenue,currency)}</td>
              <td>{formatCurrency(d.cashback,currency)}</td>
              <td>{formatCurrency(d.netRevenue,currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  return (
    <>
      <Head><title>Publisher Forecasts</title></Head>
      <main className="container">
        <div className="top-bar">
          <div className="nav-links">
            <Link href="/">Forecasting</Link>
            <Link href="/publishers">Publishers</Link>
            <Link href="/publisher-forecast">Publisher Forecasts</Link>
            <Link href="/saved-forecasts">Saved Forecasts</Link>
          </div>
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
              <option value="9">9 Months</option>
              <option value="12">12 Months</option>
            </select>
          </label>
          <label>Starting Month
            <select value={startMonth} onChange={e=>setStartMonth(e.target.value)}>
              {MONTHS.map(m=>(<option key={m} value={m}>{m}</option>))}
            </select>
          </label>

          {mode==='always' ? (
            <>
              <label className="full-width">Transaction Count
                <input type="text" value={formatInputValue(allTx)} onChange={e=>setAllTx(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">Transaction Revenue
                <input type="text" value={formatInputValue(allRevenue)} onChange={e=>setAllRevenue(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">Cashback %
                <input type="text" value={formatInputValue(allCashback)} onChange={e=>setAllCashback(parseInputValue(e.target.value))} />
              </label>
            </>
          ) : (
            <>
              <label className="full-width">Existing Transaction Count
                <input type="text" value={formatInputValue(existingTx)} onChange={e=>setExistingTx(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">Existing Customer Revenue
                <input type="text" value={formatInputValue(existingRevenue)} onChange={e=>setExistingRevenue(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">Existing Cashback %
                <input type="text" value={formatInputValue(existingCashback)} onChange={e=>setExistingCashback(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">New Transaction Count
                <input type="text" value={formatInputValue(newTx)} onChange={e=>setNewTx(parseInputValue(e.target.value))} />
              </label>
              <label className="full-width">New Customer Revenue
                <input type="text" value={formatInputValue(newRevenue)} onChange={e=>setNewRevenue(parseInputValue(e.target.value))} />
              </label>
          <label className="full-width">New Cashback %
            <input type="text" value={formatInputValue(newCashback)} onChange={e=>setNewCashback(parseInputValue(e.target.value))} />
          </label>
        </>
      )}
        <div className="checkbox-row full-width">
          <label className="checkbox">
            <input type="checkbox" checked={instore} onChange={e=>setInstore(e.target.checked)} /> In-store Offer
          </label>
        </div>
        {instore && (
          <>
            <label className="full-width">In-store Transaction Count
              <input type="text" value={formatInputValue(instoreTx)} onChange={e=>setInstoreTx(parseInputValue(e.target.value))} />
            </label>
            <label className="full-width">In-store Revenue
              <input type="text" value={formatInputValue(instoreRevenue)} onChange={e=>setInstoreRevenue(parseInputValue(e.target.value))} />
            </label>
          </>
        )}
        <label className="full-width">Other Offer Details
          <input value={otherDetails} onChange={e=>setOtherDetails(e.target.value)} />
        </label>
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
                {results.offerBreakdown && <option value="offer">By Offer Type</option>}
                {results.channelBreakdown && <option value="channel">By Channel</option>}
                <option value="all">View All</option>
              </select>
              <button type="button" onClick={downloadPdf}>Download PDF</button>
            </div>
            <h2>
              {retailer
                ? `${retailer} - ${forecastLength} Month Forecast`
                : `${forecastLength} Month Forecast`}
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
                      {makeRow('Transaction Count',results.monthly.map(m=>m.orders),v=>formatNumber(Math.round(v)))}
                      {makeRow('Revenue',results.monthly.map(m=>m.revenue),v=>formatCurrency(v,currency))}
                      {makeRow('Total Cashback',results.monthly.map(m=>m.cashback),v=>formatCurrency(v,currency))}
                      {makeRow('Net Revenue',results.monthly.map(m=>m.netRevenue),v=>formatCurrency(v,currency))}
                    </>
                  );
                })()}
              </tbody>
            </table>
            <button type="button" onClick={()=>setShowTrc(!showTrc)} className="full-width trc-toggle-btn">
              {showTrc ? 'Hide' : 'Show'} The Reward Collection Revenue Projections
            </button>
            {showTrc && (
              <div className="trc-section">
                {mode==='always' ? (
                  <label className="full-width">TRC Margin %
                    <input type="text" value={formatInputValue(trcMargin)} onChange={e=>setTrcMargin(parseInputValue(e.target.value))} />
                  </label>
                ) : (
                  <>
                    <label className="full-width">TRC Margin Existing %
                      <input type="text" value={formatInputValue(trcMarginExisting)} onChange={e=>setTrcMarginExisting(parseInputValue(e.target.value))} />
                    </label>
                    <label className="full-width">TRC Margin New %
                      <input type="text" value={formatInputValue(trcMarginNew)} onChange={e=>setTrcMarginNew(parseInputValue(e.target.value))} />
                    </label>
                  </>
                )}
                <table className="monthly-table">
                  <thead>
                    <tr>
                      <th></th>
                      {results.monthLabels.map((m,i)=>(<th key={i}>{m}</th>))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(()=>{
                      const makeRow=(label,arr,fmt)=>{const tot=arr.reduce((a,b)=>a+b,0);return (<tr><td>{label}</td>{arr.map((v,i)=>(<td key={i}>{fmt(v)}</td>))}<td>{fmt(tot)}</td></tr>);};
                      return (
                        <>
                          {makeRow('Transaction Count',results.monthly.map(m=>m.orders),v=>formatNumber(Math.round(v)))}
                          {makeRow('Revenue',results.monthly.map(m=>m.revenue),v=>formatCurrency(v,currency))}
                          {makeRow('Total Cashback',results.monthly.map(m=>m.cashback),v=>formatCurrency(v,currency))}
                          {makeRow('Net Revenue',results.monthly.map(m=>m.netRevenue),v=>formatCurrency(v,currency))}
                          {makeRow('TRC Revenue',results.trcMonthly||[],v=>formatCurrency(v,currency))}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            )}
            <p className="disclaimer">
              <strong>Disclaimer:</strong><br />
              All forecasts are based on historical performance data and may fluctuate depending on a range of variables. These figures are intended as directional guidance rather than fixed budgets, offering insight into the potential success of your campaign with The Reward Collection.<br /><br />
              We’re looking forward to getting this campaign up and running with {publisher} and continuing to build on our partnership.<br /><br />
              Thanks,<br />
              {manager.charAt(0).toUpperCase()+manager.slice(1)}<br />
              {manager}@thewardcollection.com
            </p>
            <button type="button" onClick={saveForecast} className="save-btn">Save Forecast</button>
          </div>
        )}
      </main>
    </>
  );
}
