import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('forecasts');
    if (stored) {
      try {
        setForecasts(JSON.parse(stored));
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
        const loaded = (data || []).map((row) => ({
          id: row.id,
          savedAt: row.saved_at || row.created_at,
          type: row.type,
          retailer: row.retailer,
          publisher: row.publisher,
          rep: row.rep,
          manager: row.manager,
          inputs: row.inputs,
          results: row.results,
          currency: row.currency,
        }));
        setForecasts(loaded);
        localStorage.setItem('forecasts', JSON.stringify(loaded));
      } else {
        console.error(error);
        setForecasts([]);
        if (!stored) setForecasts([]);
      }
    }
    load();
  }, []);

  const addForecast = async (data) => {
    const id = Date.now();
    const optimistic = { id, savedAt: Date.now(), ...data };
    setForecasts((prev) => {
      const next = [optimistic, ...(prev || [])];
      localStorage.setItem('forecasts', JSON.stringify(next));
      return next;
    });
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([
        {
          id,
          type: data.type,
          retailer: data.retailer,
          publisher: data.publisher,
          rep: data.rep,
          manager: data.manager,
          inputs: data.inputs,
          results: data.results,
          currency: data.currency,
        },
      ])
      .select()
      .single();
    if (!error && inserted) {
      setForecasts((prev) => {
        const next = (prev || []).map((f) =>
          f.id === id
            ? { ...f, savedAt: inserted.saved_at || inserted.created_at }
            : f
        );
        localStorage.setItem('forecasts', JSON.stringify(next));
        return next;
      });
    } else if (error) {
      console.error(error);
    }
  };

  const removeForecast = async (id) => {
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (!error) {
      setForecasts((prev) => {
        const next = (prev || []).filter((f) => f.id !== id);
        localStorage.setItem('forecasts', JSON.stringify(next));
        return next;
      });
    } else if (error) {
      console.error(error);
    }
  };

  return [forecasts || [], addForecast, removeForecast, forecasts !== null];
}
