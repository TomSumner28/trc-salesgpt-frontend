import Head from 'next/head';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';

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
  const COLORS = ['#00BFFF', '#007ACC', '#005B99', '#003F73'];

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
      let details = [];

      regions.forEach(region => {
        const reach = reachByRegion[region] || 0;
        const baseSales = reach * conversionRate;
        const baseRevenue = baseSales * aov;
        const baseCost = baseRevenue * (cashback / 100);

        const adjustedRevenue = baseRevenue * momMultipliers[i];
        const adjustedCost = baseCost * momMultipliers[i];
        const adjustedSales = baseSales * momMultipliers[i];

        regionCostMap[region] = (regionCostMap[region] || 0) + adjustedCost;

        details.push({
          region,
          sales: Math.round(adjustedSales),
          revenue: adjustedRevenue,
          cost: adjustedCost,
          roas: adjustedCost ? adjustedRevenue / adjustedCost : 0
        });

        monthSales += adjustedSales;
        monthRevenue += adjustedRevenue;
        monthCost += adjustedCost;
      });

      monthlyData.push({
        name: `Month ${i + 1}`,
        sales: Math.round(monthSales),
        revenue: monthRevenue,
        cost: monthCost,
        roas: monthCost ? monthRevenue / monthCost : 0,
        details
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

  const exportToExcel = () => {
    const exportData = results.monthlyData.flatMap(month =>
      month.details.map(detail => ({
        Month: month.name,
        Region: detail.region,
        Sales: detail.sales,
        Revenue: detail.revenue,
        Cost: detail.cost,
        ROAS: detail.roas
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Forecast');
    XLSX.writeFile(workbook, 'TRC_Forecast.xlsx');
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial' }}>
      <Head><title>TRC Forecasting GPT</title></Head>
      <main>
        <h1 style={{ color: '#00BFFF', fontSize: '2rem' }}>TRC Forecasting GPT</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <input placeholder="Retailer Name" value={retailer} onChange={e => setRetailer(e.target.value)} style={{ padding: '0.5rem' }} />
          <select value={tier} onChange={e => setTier(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="1">Tier 1 (0.1%)</option>
            <option value="2">Tier 2 (0.05%)</option>
            <option value="3">Tier 3 (0.025%)</option>
          </select>
        </div>

        <h2 style={{ marginTop: '1rem', color: '#00BFFF' }}>Regions</h2>
        {allRegions.map(region => (
          <label key={region} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={regions.includes(region)} onChange={() => handleRegionSelect(region)} /> {region}
          </label>
        ))}

        <h2 style={{ marginTop: '1rem', color: '#00BFFF' }}>Offer Types</h2>
        {allOfferTypes.map(type => (
          <label key={type} style={{ marginRight: '1rem' }}>
            <input type="checkbox" checked={offerTypes.includes(type)} onChange={() => handleOfferTypeToggle(type)} /> {type}
          </label>
        ))}

        {offerTypes.includes('In-Store') && (
          <>
            <label style={{ display: 'block', marginTop: '1rem' }}>Number of Stores: </label>
            <input type="number" value={storeCount} onChange={e => setStoreCount(Number(e.target.value))} style={{ padding: '0.5rem' }} />
          </>
        )}

        {regions.map(region => (
          <div key={region}>
            <label>{region} Reach:</label>
            <input type="number" value={reachByRegion[region] || ''} onChange={e => handleReachChange(region, e.target.value)} style={{ marginLeft: '1rem', padding: '0.5rem' }} />
          </div>
        ))}

        <label style={{ display: 'block', marginTop: '1rem' }}>Average Order Value:</label>
        <input type="number" value={aov} onChange={e => setAov(Number(e.target.value))} style={{ padding: '0.5rem' }} />

        <label style={{ display: 'block', marginTop: '1rem' }}>Cashback (%): {cashback}%</label>
        <input type="range" min="0" max="100" value={cashback} onChange={e => setCashback(Number(e.target.value))} />

        <br />
        <button onClick={handleSubmit} style={{ marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: '#00BFFF', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Generate Forecast</button>

        {results && (
          <div style={{ marginTop: '2rem' }}>
            <button onClick={exportToExcel} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#003F73', border: 'none', borderRadius: '6px', color: '#fff' }}>
              Download to Excel
            </button>

            <h3>Campaign Totals</h3>
            <p>Total Sales: {results.totalSales.toLocaleString()}</p>
            <p>Total Revenue: {formatCurrency(results.totalRevenue, results.isUSD)}</p>
            <p>Total Cost: {formatCurrency(results.totalCost, results.isUSD)}</p>
            <p>Average Monthly Cost: {formatCurrency(results.avgMonthlyCost, results.isUSD)}</p>
            <p>Total ROAS: {results.totalRoas.toFixed(2)}x</p>

            <h3>Monthly Forecast by Region</h3>
            <table style={{ width: '100%', backgroundColor: '#111', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th>Month</th><th>Region</th><th>Sales</th><th>Revenue</th><th>Cost</th><th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {results.monthlyData.map((month, i) => (
                  month.details.map((detail, j) => (
                    <tr key={i + '-' + j}>
                      <td>{j === 0 ? month.name : ''}</td>
                      <td>{detail.region}</td>
                      <td>{detail.sales.toLocaleString()}</td>
                      <td>{formatCurrency(detail.revenue, results.isUSD)}</td>
                      <td>{formatCurrency(detail.cost, results.isUSD)}</td>
                      <td>{detail.roas.toFixed(2)}x</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results.monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#00BFFF" name="Revenue" />
                <Line type="monotone" dataKey="cost" stroke="#FF8C00" name="Cost" />
              </LineChart>
            </ResponsiveContainer>

            <h3>Regional Spend Breakdown</h3>
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