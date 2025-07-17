import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('id', { ascending: false });
      if (!error) {
        setForecasts(
          (data || []).map((row) => ({
            id: row.id,
            savedAt: row.created_at,
            ...row.data,
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
    const { data: inserted, error } = await supabase
      .from('forecasts')
      .insert([{ data }])
      .select()
      .single();
    if (!error && inserted) {
      setForecasts((prev) => [
        ...(prev || []),
        { id: inserted.id, savedAt: inserted.created_at, ...data },
      ]);
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
