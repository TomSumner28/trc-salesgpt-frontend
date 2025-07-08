
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
  const [tactical, setTactical] = useState(false);
  const [newCashback, setNewCashback] = useState(0);
  const [offerTypes, setOfferTypes] = useState([]);
  const [storeCount, setStoreCount] = useState(0);
  const [reachByRegion, setReachByRegion] = useState({});
  const [results, setResults] = useState(null);
  const [showRegionDetails, setShowRegionDetails] = useState(false);

  const tiers = {
    '1': 0.001, '2': 0.0005, '3': 0.00025,
    '4': 0.000125, '5': 0.000085, '6': 0.00005
  };
  const allRegions = ['UK','US','EU','APAC'];
  const momMult = [1.00,1.03,1.05,1.04,1.09,1.11];
  const COLORS = ['#00BFFF','#007ACC','#005B99','#003F73','#001F3F','#00121A'];

  const formatCurrency = (v,useUSD=false)=>
    new Intl.NumberFormat('en-US',{style:'currency',currency: useUSD?'USD':'GBP',minimumFractionDigits:2}).format(v);

  const calcConv = ()=> {
    let r = tiers[tier] || 0;
    if(offerTypes.includes('In-Store') && storeCount>0) r += storeCount*0.00001;
    return r;
  };

  const handleSubmit = () => {
    const isUSD = regions.length===1 && regions[0]==='US';
    const conv = calcConv();
    let monthlyData=[], regionCost={}, totalRev=0, totalCost=0;
    for(let i=0;i<6;i++){
      let details=[], mSales=0, mRev=0, mCost=0;
      regions.forEach(region=>{
        const reach=reachByRegion[region]||0;
        const baseSales=reach*conv*momMult[i];
        const baseRev=baseSales*aov;
        if(tactical){
          if(newCashback>0){
            const existsSales=baseSales*0.6, newSales=baseSales*0.4;
            const existsRev=existsSales*aov, newRev=newSales*aov;
            const existsCost=existsRev*(cashback/100), newCost=newRev*(newCashback/100);
            details.push({region,segment:'Existing',sales:Math.round(existsSales),revenue:existsRev,cost:existsCost,roas:existsCost?existsRev/existsCost:0});
            details.push({region,segment:'New',sales:Math.round(newSales),revenue:newRev,cost:newCost,roas:newCost?newRev/newCost:0});
            mSales+=existsSales+newSales; mRev+=existsRev+newRev; mCost+=existsCost+newCost;
            regionCost[region]=(regionCost[region]||0)+existsCost+newCost;
          } else {
            const sales=baseSales*0.4, rev=sales*aov, cost=rev*(newCashback/100);
            details.push({region,segment:'New-only',sales:Math.round(sales),revenue:rev,cost:cost,roas:cost?rev/cost:0});
            mSales+=sales; mRev+=rev; mCost+=cost;
            regionCost[region]=(regionCost[region]||0)+cost;
          }
        } else {
          const rev=baseRev, cost=rev*(cashback/100);
          details.push({region,segment:'Standard',sales:Math.round(baseSales),revenue:rev,cost:cost,roas:cost?rev/cost:0});
          mSales+=baseSales; mRev+=rev; mCost+=cost;
          regionCost[region]=(regionCost[region]||0)+cost;
        }
      });
      monthlyData.push({name:`Month ${i+1}`,details,monthSales:mSales,monthRev:mRev,monthCost:mCost,monthRoas:mCost?mRev/mCost:0});
      totalRev+=mRev; totalCost+=mCost;
    }
    const pieData=Object.entries(regionCost).map(([region,value])=>({region,value}));
    setResults({monthlyData,totalRev,totalCost,avgCost:totalCost/6,isUSD,pieData});
  };

  const exportExcel = () => {
    const data = results.monthlyData.flatMap(m=>m.details.map(d=>({
      Month:m.name,Region:d.region,Segment:d.segment,Sales:d.sales,Revenue:d.revenue,Cost:d.cost,ROAS:d.roas
    })));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Forecast');
    XLSX.writeFile(wb,'forecast.xlsx');
  };

  return (
    <div style={{background:'#0a0a0a',color:'#fff',padding:'2rem',fontFamily:'Arial'}}>
      <Head><title>TRC Forecast GPT Tactical</title></Head>
      <h1 style={{color:'#00BFFF'}}>TRC Forecast GPT Tactical</h1>
      <label style={{marginBottom:'1rem',display:'block'}}><input type="checkbox" checked={showRegionDetails} onChange={()=>setShowRegionDetails(!showRegionDetails)}/> Show Region Breakdown</label>
      <button onClick={handleSubmit}>Generate Forecast</button>
      {results && (
        <div>
          <h2>Monthly Breakdown</h2>
          <table style={{width:'100%',background:'#111',borderCollapse:'collapse'}}>
            <thead><tr><th>Month</th><th>Sales</th><th>Revenue</th><th>Cost</th><th>ROAS</th></tr></thead>
            <tbody>
              {results.monthlyData.map((m,i)=>(
                <tr key={i}><td>{m.name}</td><td>{m.monthSales}</td><td>{formatCurrency(m.monthRev,results.isUSD)}</td><td>{formatCurrency(m.monthCost,results.isUSD)}</td><td>{m.monthRoas.toFixed(2)}x</td></tr>
              ))}
            </tbody>
          </table>
          {showRegionDetails && (
            <>
              <h3>Region Details</h3>
              <table style={{width:'100%',background:'#111',borderCollapse:'collapse'}}>
                <thead><tr><th>Month</th><th>Region</th><th>Segment</th><th>Sales</th><th>Revenue</th><th>Cost</th><th>ROAS</th></tr></thead>
                <tbody>
                  {results.monthlyData.map((m,i)=>m.details.map((d,j)=>(
                    <tr key={i+'-'+j}><td>{j===0?m.name:''}</td><td>{d.region}</td><td>{d.segment}</td><td>{d.sales}</td><td>{formatCurrency(d.revenue,results.isUSD)}</td><td>{formatCurrency(d.cost,results.isUSD)}</td><td>{d.roas.toFixed(2)}x</td></tr>
                  )))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
