import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [showUK, setShowUK] = useState(true);
  const [showUS, setShowUS] = useState(true);

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'Arial', padding: '2rem' }}>
      <Head>
        <title>TRC Forecast GPT – Clean UI</title>
      </Head>
      <h1 style={{ color: '#00BFFF' }}>📊 TRC Forecast GPT</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
        Toggle below to show/hide breakdowns by region per month.
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input type="checkbox" checked={showUK} onChange={() => setShowUK(!showUK)} />
          Show UK
        </label>
        <span style={{ marginLeft: '2rem' }}>
          <label>
            <input type="checkbox" checked={showUS} onChange={() => setShowUS(!showUS)} />
            Show US
          </label>
        </span>
      </div>
      <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px' }}>
        <h2 style={{ color: '#00BFFF' }}>📅 Month 1</h2>
        {showUK && (
          <>
            <p>🇬🇧 UK – Existing: £19,200.00 | Cost: £1,920.00 | ROAS: 10.00x</p>
            <p>🇬🇧 UK – New: £12,800.00 | Cost: £1,920.00 | ROAS: 6.67x</p>
          </>
        )}
        {showUS && (
          <>
            <p>🇺🇸 US – Existing: £96,000.00 | Cost: £9,600.00 | ROAS: 10.00x</p>
            <p>🇺🇸 US – New: £64,000.00 | Cost: £9,600.00 | ROAS: 6.67x</p>
          </>
        )}
      </div>
    </div>
  );
}