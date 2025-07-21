import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function parseNumber(value) {
  if (value == null) return 0;
  const num = parseFloat(String(value).replace(/[^0-9.]+/g, ''));
  return Number.isNaN(num) ? 0 : num;
}

function parseBool(value) {
  if (value == null) return false;
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase();
  return str === 'true' || str === 'yes' || str === '1';
}

// Fallback data used when Supabase isn't configured
export const DEFAULT_PUBLISHERS = [];

export function usePublishers() {
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    async function load() {
      if (supabase) {
        // Table names may vary by project, so try a few common options
        let { data, error } = await supabase.from('publishers').select('*');
        if (error || !data || !data.length) {
          ({ data, error } = await supabase.from('Publishers').select('*'));
        }
        if (error || !data || !data.length) {
          ({ data, error } = await supabase.from('publisher').select('*'));
        }
        if (!error && data && data.length) {
          const mapped = data.map((row) => ({
            id: row.id,
            network: row.Network_Publishers ?? row.network_publishers ?? row.network ?? '',
            sub: row.Sub_Publishers ?? row.sub_publishers ?? row.sub ?? '',
            status: row.Status ?? row.status ?? '',
            regions: Array.isArray(row.Regions ?? row.regions)
              ? (row.Regions ?? row.regions)
              : String(row.Regions ?? row.regions ?? '')
                  .split(',')
                  .map((r) => r.trim().toUpperCase())
                  .filter(Boolean),
            reach: parseNumber(row.Reach ?? row.reach),
            newCustomers: parseBool(row.New_Customers ?? row.new_customers),
          }));
          setPublishers(mapped);
          return;
        }
        if (error) console.error(error);
      }
      setPublishers(DEFAULT_PUBLISHERS);
    }
    load();
  }, []);

  return [publishers];
}

export function computeReach(publishers, region, includeNew) {
  return publishers
    .filter(
      (p) =>
        (p.regions || []).includes(region) &&
        (!includeNew || p.newCustomers)
    )
    .reduce((sum, p) => sum + (p.reach || 0), 0);
}
