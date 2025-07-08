import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [retailer, setRetailer] = useState('');
  const [regions, setRegions] = useState([]);
  const [aov, setAov] = useState(0);
  const [cashback, setCashback] = useState(10);
  const [conversionRate, setConversionRate] = useState(5);
  const [reachByRegion, setReachByRegion] = useState({});
  const [results, setResults] = useState(null);

  const allRegions = ['UK', 'US', 'EU', 'APAC'];

  const handleReachChange = (region, value) => {
    setReachByRegion(prev => ({ ...prev, [region]: Number(value) }));
  };

  const handleRegionSelect = (region) => {
    setRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleSubmit = () => {
    let monthlyData = [];
    let totalSales = 0, totalRevenue = 0, totalCost = 0;

    regions.forEach(region => {
      const reach = reachByRegion[region] || 0;
      const convRate = conversionRate / 100;
      const sales = reach * convRate;
      const revenue = sales * aov;
      const cost = revenue * (cashback / 100);

      for (let i = 0; i < 6; i++) {
        monthlyData.push({
          month: `Month ${i + 1}`,
          region,
          sales,
          revenue,
          cost,
          roas: cost ? revenue / cost : 0
        });
      }

      totalSales += sales * 6;
      totalRevenue += revenue * 6;
      totalCost += cost * 6;
    });

    setResults({
      monthlyData,
      totalSales,
      totalRevenue,
      totalCost,
      totalRoas: totalCost ? totalRevenue / totalCost : 0
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial' }}>
      <Head>
        <title>Forecasting GPT</title>
      </Head>
      <main>
        <h1 style={{ color: '#00BFFF' }}>Forecasting GPT</h1>

        <input placeholder="Retailer Name" value={retailer} onChange={e => setRetailer(e.target.value)} style={{ margin: '0.5rem', padding: '0.5rem' }} />

        <h2 style={{ marginTop: '1rem' }}>Select Regions</h2>
        {allRegions.map(region => (
          <label key={region} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={regions.includes(region)} onChange={() => handleRegionSelect(region)} />
            {region}
          </label>
        ))}

        <h2 style={{ marginTop: '1rem' }}>Variables</h2>
        {regions.map(region => (
          <div key={region}>
            <label>{region} Reach: </label>
            <input type="number" value={reachByRegion[region] || ''} onChange={e => handleReachChange(region, e.target.value)} style={{ margin: '0.5rem' }} />
          </div>
        ))}

        <label>Conversion Rate (%): </label>
        <input type="number" value={conversionRate} onChange={e => setConversionRate(Number(e.target.value))} style={{ margin: '0.5rem' }} />
        <br />
        <label>Average Order Value (£): </label>
        <input type="number" value={aov} onChange={e => setAov(Number(e.target.value))} style={{ margin: '0.5rem' }} />
        <br />
        <label>Cashback (%): </label>
        <input type="range" min="0" max="100" value={cashback} onChange={e => setCashback(Number(e.target.value))} />
        <span>{cashback}%</span>

        <br /><br />
        <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem', backgroundColor: '#00BFFF', border: 'none', color: '#000' }}>
          Generate Forecast
        </button>

        {results && (
          <div style={{ marginTop: '2rem' }}>
            <h2>6-Month Forecast</h2>
            {results.monthlyData.map((data, index) => (
              <div key={index}>
                <strong>{data.month} ({data.region}):</strong><br />
                Sales: {data.sales.toFixed(0)} | Revenue: £{data.revenue.toFixed(2)} | Cost: £{data.cost.toFixed(2)} | ROAS: {data.roas.toFixed(2)}x
              </div>
            ))}
            <h3 style={{ marginTop: '1rem' }}>Total 6-Month Campaign</h3>
            <p>Sales: {results.totalSales.toFixed(0)}</p>
            <p>Revenue: £{results.totalRevenue.toFixed(2)}</p>
            <p>Cost: £{results.totalCost.toFixed(2)}</p>
            <p>ROAS: {results.totalRoas.toFixed(2)}x</p>
          </div>
        )}
      </main>
    </div>
  );
}