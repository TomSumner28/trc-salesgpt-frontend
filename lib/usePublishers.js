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
  const str = String(value).trim().toLowerCase();
  return str === 'true' || str === 'yes' || str === '1' || str === 'y';
}

function normalizeRegion(value) {
  if (!value) return null;
  const s = String(value).trim().toUpperCase();
  if (s.startsWith('UK')) return 'UK';
  if (s === 'US' || s === 'USA' || s.startsWith('UNITED STATES')) return 'US';
  if (s === 'EU' || s === 'EUROPE' || s.startsWith('EURO')) return 'EU';
  return s;
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
          const mapped = data.map((row) => {
            const raw = row.Regions ?? row.regions ?? '';
            const list = Array.isArray(raw) ? raw : String(raw).split(',');
            const regions = list
              .map((r) => normalizeRegion(r))
              .filter(Boolean);
            return {
              id: row.id,
              network: row.Network_Publishers ?? row.network_publishers ?? row.network ?? '',
              sub: row.Sub_Publishers ?? row.sub_publishers ?? row.sub ?? '',
              status: row.Status ?? row.status ?? '',
              regions,
              reach: parseNumber(row.Reach ?? row.reach),
              newCustomers: parseBool(row.New_Customers ?? row.new_customers),
            };
          });
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
  const target = normalizeRegion(region);
  return publishers
    .filter(
      (p) =>
        (p.regions || []).includes(target) &&
        (!includeNew || p.newCustomers)
    )
    .reduce((sum, p) => sum + (p.reach || 0), 0);
}
