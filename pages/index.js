import Head from 'next/head';
import { useState } from 'react';

const sampleData = [
  {
    month: 'Month 1',
    total: { revenue: 192000, cost: 19200, roas: 10 },
    breakdown: {
      UK: {
        existing: { revenue: 19200, cost: 1920, roas: 10 },
        new: { revenue: 12800, cost: 1920, roas: 6.67 }
      },
      US: {
        existing: { revenue: 96000, cost: 9600, roas: 10 },
        new: { revenue: 64000, cost: 9600, roas: 6.67 }
      }
    }
  },
  {
    month: 'Month 2',
    total: { revenue: 205920, cost: 20592, roas: 10 },
    breakdown: {
      UK: {
        existing: { revenue: 19776, cost: 1978, roas: 10 },
        new: { revenue: 13184, cost: 1978, roas: 6.67 }
      },
      US: {
        existing: { revenue: 98592, cost: 9859, roas: 10 },
        new: { revenue: 65768, cost: 9859, roas: 6.67 }
      }
    }
  },
  {
    month: 'Month 3',
    total: { revenue: 210038, cost: 21004, roas: 10 },
    breakdown: {
      UK: {
        existing: { revenue: 20171, cost: 2017, roas: 10 },
        new: { revenue: 13452, cost: 2017, roas: 6.67 }
      },
      US: {
        existing: { revenue: 100819, cost: 10082, roas: 10 },
        new: { revenue: 67296, cost: 10082, roas: 6.67 }
      }
    }
  }
];

export default function Home() {
  const [showRegions, setShowRegions] = useState(false);

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'Arial', padding: '2rem' }}>
      <Head><title>TRC Forecasting GPT – Full Forecast Tool</title></Head>
      <h1 style={{ color: '#00BFFF' }}>📊 TRC Forecasting GPT</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <input type="checkbox" checked={showRegions} onChange={() => setShowRegions(!showRegions)} />
          Show region breakdowns
        </label>
      </div>

      {sampleData.map((entry, idx) => (
        <div key={idx} style={{ background: '#111', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ color: '#00BFFF' }}>{entry.month}</h2>
          <p><strong>Total</strong> – Revenue: £{entry.total.revenue.toLocaleString()}, Cost: £{entry.total.cost.toLocaleString()}, ROAS: {entry.total.roas.toFixed(2)}x</p>

          {showRegions && (
            <div style={{ marginLeft: '1rem' }}>
              {Object.entries(entry.breakdown).map(([region, segments]) => (
                <div key={region}>
                  <h4>{region === 'UK' ? '🇬🇧 UK' : '🇺🇸 US'}</h4>
                  {Object.entries(segments).map(([segment, values]) => (
                    <p key={segment}>
                      {segment === 'existing' ? 'Existing' : 'New'} – Revenue: £{values.revenue.toLocaleString()}, 
                      Cost: £{values.cost.toLocaleString()}, 
                      ROAS: {values.roas.toFixed(2)}x
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}