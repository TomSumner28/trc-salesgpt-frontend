import { useState, useEffect } from 'react';

export function useSavedForecasts() {
  const [forecasts, setForecasts] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedForecasts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setForecasts(Array.isArray(parsed) ? parsed : []);
      } else {
        setForecasts([]);
      }
    } catch (e) {
      console.error(e);
      setForecasts([]);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(forecasts)) {
      localStorage.setItem('savedForecasts', JSON.stringify(forecasts));
    }
  }, [forecasts]);

  const addForecast = (data) => {
    setForecasts((prev = []) => [
      ...prev,
      { id: Date.now(), savedAt: Date.now(), ...data },
    ]);
  };

  const removeForecast = (id) => {
    setForecasts((prev = []) => prev.filter((f) => f.id !== id));
  };

  return [forecasts, addForecast, removeForecast];
}
