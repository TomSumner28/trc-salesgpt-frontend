import { useState, useEffect } from 'react';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('forecasts');
    if (stored) {
      try {
        setForecasts(JSON.parse(stored));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setForecasts([]);
  }, []);

  useEffect(() => {
    if (forecasts) {
      localStorage.setItem('forecasts', JSON.stringify(forecasts));
    }
  }, [forecasts]);

  const addForecast = async (data) => {
    const entry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      ...data,
    };
    setForecasts((prev) => [...(prev || []), entry]);
    return entry;
  };

  const removeForecast = async (id) => {
    setForecasts((prev) => (prev || []).filter((f) => f.id !== id));
  };

  return [forecasts, addForecast, removeForecast];
}
