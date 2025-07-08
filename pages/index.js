import Head from 'next/head'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'

export default function Home() {
  const [retailer, setRetailer] = useState('');
  const [regions, setRegions] = useState([]);
  const [tier, setTier] = useState('1');
  const [aov, setAov] = useState(0);
  const [cashback, setCashback] = useState(10);
  const [offerTypes, setOfferTypes] = useState([]);
  const [storeCount, setStoreCount] = useState(0);
  const [reachByRegion, setReachByRegion] = useState({});
  const [results, setResults] = useState(null);

  const allRegions = ['UK', 'US', 'EU', 'APAC'];
  const allOfferTypes = ['Online', 'In-Store'];
  const momMultipliers = [1.00, 1.03, 1.05, 1.04, 1.09, 1.11];
  const tierConversionRates = { '1': 0.001, '2': 0.0005, '3': 0.00025 };
  const estimatedInStoreConversionBoostPerStore = 0.00001;
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

  const formatCurrency = (value, useUSD = false) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: useUSD ? 'USD' : 'GBP',
      minimumFractionDigits: 2
    }).format(value);

  const handleReachChange = (region, value) => {
    setReachByRegion(prev => ({ ...prev, [region]: Number(value) }));
  };

  const handleRegionSelect = (region) => {
    setRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleOfferTypeToggle = (type) => {
    setOfferTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const calculateConversionRate = () => {
    let baseRate = tierConversionRates[tier] || 0;
    if (offerTypes.includes('In-Store') && storeCount > 0) {
      baseRate += storeCount * estimatedInStoreConversionBoostPerStore;
    }
    return baseRate;
  };

  const handleSubmit = () => {
    const isUSD = regions.length === 1 && regions[0] === 'US';
    const conversionRate = calculateConversionRate();
    let monthlyData = [];
    let regionCostMap = {};
    let totalSales = 0, totalRevenue = 0, totalCost = 0;

    for (let i = 0; i < 6; i++) {
      let monthSales = 0, monthRevenue = 0, monthCost = 0;
      regions.forEach(region => {
        const reach = reachByRegion[region] || 0;
        const baseSales = reach * conversionRate;
        const baseRevenue = baseSales * aov;
        const baseCost = baseRevenue * (cashback / 100);

        const adjustedRevenue = baseRevenue * momMultipliers[i];
        const adjustedCost = baseCost * momMultipliers[i];
        const adjustedSales = baseSales * momMultipliers[i];

        regionCostMap[region] = (regionCostMap[region] || 0) + adjustedCost;
        monthSales += adjustedSales;
        monthRevenue += adjustedRevenue;
        monthCost += adjustedCost;
      });

      monthlyData.push({
        name: `Month ${i + 1}`,
        sales: Math.round(monthSales),
        revenue: monthRevenue,
        cost: monthCost,
        roas: monthCost ? monthRevenue / monthCost : 0
      });

      totalSales += monthSales;
      totalRevenue += monthRevenue;
      totalCost += monthCost;
    }

    const pieData = Object.entries(regionCostMap).map(([region, value]) => ({
      region,
      value
    }));

    setResults({
      monthlyData,
      totalSales,
      totalRevenue,
      totalCost,
      avgMonthlyCost: totalCost / 6,
      totalRoas: totalCost ? totalRevenue / totalCost : 0,
      isUSD,
      pieData
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <Head><title>Forecasting GPT</title></Head>
      <main>
        <h1 style={{ color: '#00BFFF' }}>Forecasting GPT</h1>
        <input placeholder="Retailer Name" value={retailer} onChange={e => setRetailer(e.target.value)} style={{ margin: '0.5rem', padding: '0.5rem' }} />
        <h2>Select Regions</h2>
        {allRegions.map(region => (
          <label key={region} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={regions.includes(region)} onChange={() => handleRegionSelect(region)} /> {region}
          </label>
        ))}
        <h2>Variables</h2>
        <label>Retailer Tier:</label>
        <select value={tier} onChange={e => setTier(e.target.value)} style={{ margin: '0.5rem' }}>
          <option value="1">Tier 1 (0.1%)</option>
          <option value="2">Tier 2 (0.05%)</option>
          <option value="3">Tier 3 (0.025%)</option>
        </select>
        <h3>Offer Type</h3>
        {allOfferTypes.map(type => (
          <label key={type} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={offerTypes.includes(type)} onChange={() => handleOfferTypeToggle(type)} /> {type}
          </label>
        ))}
        {offerTypes.includes('In-Store') && (
          <>
            <label>Number of Stores: </label>
            <input type="number" value={storeCount} onChange={e => setStoreCount(Number(e.target.value))} style={{ margin: '0.5rem' }} />
          </>
        )}
        {regions.map(region => (
          <div key={region}>
            <label>{region} Reach: </label>
            <input type="number" value={reachByRegion[region] || ''} onChange={e => handleReachChange(region, e.target.value)} style={{ margin: '0.5rem' }} />
          </div>
        ))}
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
            <h2>6-Month Forecast Summary</h2>
            <p>Total Revenue: {formatCurrency(results.totalRevenue, results.isUSD)}</p>
            <p>Total Cost: {formatCurrency(results.totalCost, results.isUSD)}</p>
            <p>Average Monthly Cost: {formatCurrency(results.avgMonthlyCost, results.isUSD)}</p>
            <p>Total ROAS: {results.totalRoas.toFixed(2)}x</p>

            
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


<ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={results.pieData} dataKey="value" nameKey="region" cx="50%" cy="50%" outerRadius={100} fill="#00BFFF" label>
                  {results.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}