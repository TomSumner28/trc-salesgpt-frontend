import { useState, useEffect } from 'react';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('savedForecasts');
    if (stored) {
      try {
        setForecasts(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedForecasts', JSON.stringify(forecasts));
  }, [forecasts]);

  const addForecast = (data) => {
    setForecasts((prev) => [
      ...prev,
      { id: Date.now(), savedAt: Date.now(), ...data },
    ]);
  };

  const removeForecast = (id) => {
    setForecasts((prev) => prev.filter((f) => f.id !== id));
  };

  return [forecasts, addForecast, removeForecast];
}
