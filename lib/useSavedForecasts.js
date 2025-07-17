import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('id', { ascending: false });
      if (!cancelled) {
        if (!error) {
          const loaded = (data || []).map((row) => ({
            id: row.id,
            savedAt: row.created_at,
            ...row.data,
          }));
          setForecasts((prev) => {
            if (!prev) return loaded;
            const map = new Map(prev.map((f) => [f.id, f]));
            loaded.forEach((f) => map.set(f.id, f));
            return Array.from(map.values()).sort((a, b) => b.id - a.id);
          });
        } else {
          console.error(error);
          setForecasts((prev) => prev || []);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addForecast = async (data) => {
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([{ data }])
      .select()
      .single();
    if (!error && inserted) {
      setForecasts((prev) => {
        const list = prev ? [...prev] : [];
        list.unshift({ id: inserted.id, savedAt: inserted.created_at, ...data });
        return list;
      });
    } else if (error) {
      console.error(error);
    }
  };

  const removeForecast = async (id) => {
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (!error) {
      setForecasts((prev) => (prev || []).filter((f) => f.id !== id));
    } else {
      console.error(error);
    }
  };

  return [forecasts, addForecast, removeForecast];
}
