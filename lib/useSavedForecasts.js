import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('savedForecasts');
    if (stored) {
      try {
        setForecasts(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    async function loadRemote() {
      if (!supabase) {
        setLoaded(true);
        return;
      }
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('saved_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setForecasts(data);
      } else if (error) {
        console.error(error);
      }
      setLoaded(true);
    }

    loadRemote();
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('savedForecasts', JSON.stringify(forecasts));
    }
  }, [forecasts, loaded]);

  const addForecast = async (data) => {
    const row = {
      id: Date.now(),
      saved_at: new Date().toISOString(),
      type: data.type,
      retailer: data.retailer || '',
      publisher: data.publisher || '',
      rep: data.rep || null,
      manager: data.manager || null,
      inputs: data.inputs || null,
      results: data.results || null,
      currency: data.results?.currency || data.currency || null,
      data: data.data || null,
    };

    setForecasts((prev) => [row, ...prev]);

    if (supabase) {
      const { error } = await supabase.from('forecasts').insert(row);
      if (error) console.error(error);
    }
  };

  const removeForecast = async (id) => {
    setForecasts((prev) => prev.filter((f) => f.id !== id));
    if (supabase) {
      const { error } = await supabase.from('forecasts').delete().eq('id', id);
      if (error) console.error(error);
    }
  };

  return [forecasts, addForecast, removeForecast, loaded];
}
