import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Fallback data used when Supabase isn't configured
export const DEFAULT_PUBLISHERS = [];

export function usePublishers() {
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    async function load() {
      if (supabase) {
        let { data, error } = await supabase.from('publishers').select('*');
        if (error) {
          // Some databases may use a singular table name
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
            reach: Number(row.Reach ?? row.reach ?? 0),
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
    .filter((p) => (p.regions || []).includes(region))
    .reduce((sum, p) => sum + (p.reach || 0), 0);
}
