import Head from 'next/head'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'

export default function Home() {
  const [retailer, setRetailer] = useState('');
  const [regions, setRegions] = useState([]);
  const [aov, setAov] = useState(0);
  const [cashback, setCashback] = useState(10);
  const [conversionRate, setConversionRate] = useState(5);
  const [reachByRegion, setReachByRegion] = useState({});
  const [results, setResults] = useState(null);

  const allRegions = ['UK', 'US', 'EU', 'APAC'];

  const formatCurrency = (value, useUSD = false) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: useUSD ? 'USD' : 'GBP',
      minimumFractionDigits: 2
    }).format(value);
  };

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
    const isUSD = regions.length === 1 && regions[0] === 'US';

    regions.forEach(region => {
      const reach = reachByRegion[region] || 0;
      const convRate = conversionRate / 100;
      const sales = reach * convRate;
      const revenue = sales * aov;
      const cost = revenue * (cashback / 100);

      for (let i = 0; i < 6; i++) {
        monthlyData.push({
          name: `Month ${i + 1}`,
          region,
          sales: Math.round(sales),
          revenue: revenue,
          cost: cost,
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
      totalRoas: totalCost ? totalRevenue / totalCost : 0,
      isUSD
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

        <h2>Select Regions</h2>
        {allRegions.map(region => (
          <label key={region} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={regions.includes(region)} onChange={() => handleRegionSelect(region)} />
            {region}
          </label>
        ))}

        <h2>Variables</h2>
        {regions.map(region => (
          <div key={region}>
            <label>{region} Reach: </label>
            <input type="number" value={reachByRegion[region] || ''} onChange={e => handleReachChange(region, e.target.value)} style={{ margin: '0.5rem' }} />
          </div>
        ))}

        <label>Conversion Rate (%): </label>
        <input type="number" value={conversionRate} onChange={e => setConversionRate(Number(e.target.value))} style={{ margin: '0.5rem' }} />
        <br />
        <label>Average Order Value: </label>
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
            <h2>6-Month Forecast Table</h2>
            <table style={{ width: '100%', textAlign: 'left', backgroundColor: '#111', color: '#fff', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {results.monthlyData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.name}</td>
                    <td>{data.sales.toLocaleString()}</td>
                    <td>{formatCurrency(data.revenue, results.isUSD)}</td>
                    <td>{formatCurrency(data.cost, results.isUSD)}</td>
                    <td>{data.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: '1rem' }}>Campaign Totals</h3>
            <p>Total Sales: {results.totalSales.toLocaleString()}</p>
            <p>Total Revenue: {formatCurrency(results.totalRevenue, results.isUSD)}</p>
            <p>Total Cost: {formatCurrency(results.totalCost, results.isUSD)}</p>
            <p>Total ROAS: {results.totalRoas.toFixed(2)}x</p>

            <h3 style={{ marginTop: '2rem' }}>Graphs</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results.monthlyData}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#00BFFF" name="Revenue" />
                <Bar dataKey="cost" fill="#FF6347" name="Cost" />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roas" stroke="#32CD32" name="ROAS" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}