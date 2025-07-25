import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setForecasts([]);
        return;
      }
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('saved_at', { ascending: false });
      if (!error) {
        setForecasts(
          (data || []).map((row) => ({
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
          }))
        );
      } else {
        console.error(error);
        setForecasts([]);
      }
    }
    load();
  }, []);

  const addForecast = async (data) => {
    if (!supabase) return;
    const id = Date.now();
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([
        {
          id,
          saved_at: new Date().toISOString(),
          type: data.type,
          retailer: data.retailer || '',
          publisher: data.publisher || '',
          rep: data.rep || '',
          manager: data.manager || '',
          inputs: data.inputs || {},
          results: data.results || {},
          currency: data.currency || '',
          data,
        },
      ])
      .select()
      .single();
    if (!error && inserted) {
      setForecasts((prev) => [
        ...(prev || []),
        {
          id: inserted.id,
          savedAt: inserted.saved_at || inserted.created_at,
          type: inserted.type,
          retailer: inserted.retailer,
          publisher: inserted.publisher,
          rep: inserted.rep,
          manager: inserted.manager,
          inputs: inserted.inputs,
          results: inserted.results,
          currency: inserted.currency,
        },
      ]);
    } else if (error) {
      console.error(error);
    }
  };

  const removeForecast = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (!error) {
      setForecasts((prev) => (prev || []).filter((f) => f.id !== id));
    } else if (error) {
      console.error(error);
    }
  };

  return [forecasts, addForecast, removeForecast];
}
