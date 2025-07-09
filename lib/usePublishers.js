import { useState, useEffect } from 'react';

export const DEFAULT_PUBLISHERS = [
  { id: 1, network: 'Loyalty Key', sub: 'Visa B2C, Loyalty Key', regions: ['EU'], reach: 300000, newCustomers: true },
  { id: 2, network: 'LUX', sub: 'Revolut', regions: ['EU'], reach: 18000000, newCustomers: false },
  { id: 3, network: 'Pluxee', sub: 'Spreecard, Airtime, SuitsMe Card, Anna Money', regions: ['UK'], reach: 3500000, newCustomers: false },
  { id: 4, network: 'LUX', sub: 'Mastercard B2B', regions: ['UK'], reach: 3600000, newCustomers: false },
  { id: 5, network: 'LUX', sub: 'Revolut', regions: ['UK'], reach: 9000000, newCustomers: false },
  { id: 6, network: 'LUX', sub: 'Hyperjar', regions: ['UK'], reach: 600000, newCustomers: false },
  { id: 7, network: 'LUX', sub: 'Boogi: Capital On Tap, Give As You Live', regions: ['UK'], reach: 565000, newCustomers: true },
  { id: 9, network: 'Fidel', sub: 'Tenerity, Weselyan, Squaremeal, Next Jump, Topcashback, Complete Savings, Zilch', regions: ['UK'], reach: 1100000, newCustomers: false },
  { id:10, network: 'Collinson', sub: 'British Airways, Aerlingus', regions: ['UK'], reach: 1000000, newCustomers: false },
  { id:11, network: 'Collinson', sub: 'Tide Bank', regions: ['UK'], reach: 690000, newCustomers: true },
  { id:12, network: 'Curve', sub: 'Curve', regions: ['UK'], reach: 400000, newCustomers: false },
  { id:13, network: 'Pockit Ltd', sub: 'Pockit', regions: ['UK'], reach: 900000, newCustomers: false },
  { id:14, network: 'Railsr', sub: 'Pay IO (B2B)', regions: ['UK'], reach: 2000000, newCustomers: false },
  { id:15, network: 'LUX', sub: 'Mastercard B2B', regions: ['US'], reach: 17000000, newCustomers: false },
  { id:16, network: 'LUX', sub: 'Revolut', regions: ['US'], reach: 1000000, newCustomers: false },
  { id:17, network: 'Collinson', sub: 'JetBlue, Emirates, NCR, American Airlines, Simply Miles, Flying Blue, Virgin', regions: ['US'], reach: 16000000, newCustomers: true },
  { id:18, network: 'Fidel USA', sub: 'Dolr, Percents, Viffy', regions: ['US'], reach: 100000, newCustomers: false },
  { id:19, network: 'Fidel USA', sub: 'Cashapp', regions: ['US'], reach: 88000000, newCustomers: true },
  { id:20, network: 'Fidel USA', sub: 'PNC', regions: ['US'], reach: 9000000, newCustomers: true },
  { id:21, network: 'Fidel USA', sub: 'Bank Of America', regions: ['US'], reach: 50000000, newCustomers: true },
  { id:22, network: 'Fidel USA', sub: 'Visa B2B', regions: ['US'], reach: 1200000, newCustomers: false },
  { id:23, network: 'Fidel USA', sub: 'American Express', regions: ['US'], reach: 70000000, newCustomers: true },
  { id:24, network: 'Fidel USA', sub: 'Barclays', regions: ['US'], reach: 8000000, newCustomers: true },
  { id:25, network: 'Fidel USA', sub: 'Citadel Credit Union', regions: ['US'], reach: 100000, newCustomers: true },
  { id:26, network: 'Fidel USA', sub: 'Citizens Bank', regions: ['US'], reach: 4000000, newCustomers: true },
  { id:27, network: 'Olive', sub: 'NCAA, American Cancer Society, YouthSport, WorldVision, Shop.com, QuestTrade, Price.com', regions: ['US'], reach: 500000, newCustomers: false },
  { id:28, network: 'Drop', sub: 'Acorns', regions: ['US'], reach: 10000000, newCustomers: true },
  { id:29, network: 'Drop', sub: 'AFS (Affinity Financial Solutions)', regions: ['US'], reach: 17000000, newCustomers: true },
];

export function usePublishers() {
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('publishers');
    if (stored) {
      try {
        setPublishers(JSON.parse(stored));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setPublishers(DEFAULT_PUBLISHERS);
  }, []);

  useEffect(() => {
    localStorage.setItem('publishers', JSON.stringify(publishers));
  }, [publishers]);

  return [publishers, setPublishers];
}

export function computeReach(publishers, region, includeNew) {
  return publishers
    .filter((p) => p.regions.includes(region) && (!includeNew || p.newCustomers))
    .reduce((sum, p) => sum + p.reach, 0);
}
