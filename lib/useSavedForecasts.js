import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    let local = [];
    const stored = localStorage.getItem('savedForecasts');
    if (stored) {
      try {
        local = JSON.parse(stored);
        setForecasts(local);
      } catch (e) {
        console.error(e);
      }
    }

    async function load() {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('id', { ascending: false });
      if (!error) {
        const rows = (data || []).map((row) => ({
          id: row.id,
          savedAt: row.created_at,
          ...row.data,
        }));
        setForecasts(rows);
        localStorage.setItem('savedForecasts', JSON.stringify(rows));
      } else {
        console.error(error);
        if (local.length === 0) setForecasts([]);
      }
    }
    load();
  }, []);

  const addForecast = async (data) => {
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([{ data }])
      .select()
      .single();
    const item =
      !error && inserted
        ? { id: inserted.id, savedAt: inserted.created_at, ...data }
        : { id: Date.now(), savedAt: Date.now(), ...data };

    if (error) console.error(error);

    setForecasts((prev) => {
      const next = [...(prev || []), item];
      localStorage.setItem('savedForecasts', JSON.stringify(next));
      return next;
    });
  };

  const removeForecast = async (id) => {
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (error) console.error(error);
    setForecasts((prev) => {
      const next = (prev || []).filter((f) => f.id !== id);
      localStorage.setItem('savedForecasts', JSON.stringify(next));
      return next;
    });
  };

  return [forecasts, addForecast, removeForecast];
}
