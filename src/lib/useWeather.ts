"use client";

import { useEffect, useState } from "react";

export type WeatherData = {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    isDay: boolean;
    weatherCode: number;
  };
  daily: {
    dates: string[];
    maxTemps: number[];
    minTemps: number[];
    uvIndex: number[];
  };
};

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to a central agricultural location in Tunisia (e.g. near Sfax/Kairouan)
  // For production, this could be configured in the farm settings
  const lat = 35.6781;
  const lon = 10.0963;

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`);
        if (!res.ok) throw new Error("Failed to fetch weather data");
        const json = await res.json();
        
        setData({
          current: {
            temp: json.current.temperature_2m,
            humidity: json.current.relative_humidity_2m,
            windSpeed: json.current.wind_speed_10m,
            precipitation: json.current.precipitation,
            isDay: json.current.is_day === 1,
            weatherCode: json.current.weather_code,
          },
          daily: {
            dates: json.daily.time,
            maxTemps: json.daily.temperature_2m_max,
            minTemps: json.daily.temperature_2m_min,
            uvIndex: json.daily.uv_index_max,
          }
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  return { data, loading, error };
}
