import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  // Load any cached data first so the page isn't empty while we fetch
  useEffect(() => {
    const stored = localStorage.getItem('savedForecasts');
    if (stored) {
      try {
        setForecasts(JSON.parse(stored));
      } catch (e) {
        console.error(e);
        setForecasts([]);
      }
    } else {
      setForecasts([]);
    }
  }, []);

  // Then sync with Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data) {
        setForecasts(prev => {
          const byId = {};
          (prev || []).forEach(f => {
            byId[f.id] = f;
          });
          data.forEach(row => {
            byId[row.id] = {
              id: row.id,
              savedAt: row.created_at,
              ...row.data,
            };
          });
          const list = Object.values(byId).sort((a, b) => b.id - a.id);
          localStorage.setItem('savedForecasts', JSON.stringify(list));
          return list;
        });
      } else if (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  const addForecast = async (data) => {
    const optimistic = { id: Date.now(), savedAt: Date.now(), ...data };
    setForecasts(prev => [optimistic, ...(prev || [])]);
    localStorage.setItem(
      'savedForecasts',
      JSON.stringify([optimistic, ...(forecasts || [])])
    );
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([{ data }])
      .select()
      .single();
    if (!error && inserted) {
      setForecasts(prev => {
        const arr = (prev || []).map(f =>
          f.id === optimistic.id
            ? { id: inserted.id, savedAt: inserted.created_at, ...data }
            : f
        );
        localStorage.setItem('savedForecasts', JSON.stringify(arr));
        return arr;
      });
    } else if (error) {
      console.error(error);
    }
  };

  const removeForecast = async (id) => {
    setForecasts(prev => {
      const arr = (prev || []).filter(f => f.id !== id);
      localStorage.setItem('savedForecasts', JSON.stringify(arr));
      return arr;
    });
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (error) {
      console.error(error);
    }
  };

  return [forecasts, addForecast, removeForecast];
}

