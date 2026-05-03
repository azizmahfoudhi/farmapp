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

  // Coordonnées exactes de Nasrallah, Kairouan
  const lat = 35.3524;
  const lon = 9.8219;

  useEffect(() => {
    async function fetchWeather() {
      try {
        const apiKey = "8y6w81yh8ld4olh3llorh3b2yti48jdz9t9fa2w5";
        
        const res = await fetch(`https://www.meteosource.com/api/v1/free/point?lat=${lat}&lon=${lon}&sections=current,daily&key=${apiKey}`);
        if (!res.ok) throw new Error("Erreur de l'API Meteosource");
        
        const json = await res.json();
        
        setData({
          current: {
            temp: json.current?.temperature ?? 0,
            humidity: json.current?.humidity ?? 0, // Note: Meteosource free might not have humidity in current, we fallback to 0
            windSpeed: json.current?.wind?.speed ?? 0,
            precipitation: json.current?.precipitation?.total ?? 0,
            isDay: json.current?.icon_num !== undefined ? (json.current.icon_num < 20) : true, // Icons < 20 are usually day icons
            weatherCode: json.current?.icon_num ?? 0,
          },
          daily: {
            dates: json.daily?.data?.map((d: any) => d.day) ?? [],
            maxTemps: json.daily?.data?.map((d: any) => d.all_day?.temperature_max ?? 0) ?? [],
            minTemps: json.daily?.data?.map((d: any) => d.all_day?.temperature_min ?? 0) ?? [],
            uvIndex: json.daily?.data?.map((d: any) => 0) ?? [], // Free tier might not have UV
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
