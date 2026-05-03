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
        // ATTENTION : Vous devez insérer votre clé "Azure Maps Subscription Key" ici
        const apiKey = "VOTRE_CLE_AZURE_ICI";
        
        if (apiKey === "VOTRE_CLE_AZURE_ICI") {
          throw new Error("Veuillez renseigner votre clé Azure Maps dans src/lib/useWeather.ts");
        }

        const [currentRes, dailyRes] = await Promise.all([
          fetch(`https://atlas.microsoft.com/weather/currentConditions/json?api-version=1.1&query=${lat},${lon}&subscription-key=${apiKey}`),
          fetch(`https://atlas.microsoft.com/weather/forecast/daily/json?api-version=1.1&query=${lat},${lon}&duration=5&subscription-key=${apiKey}`)
        ]);

        if (!currentRes.ok || !dailyRes.ok) throw new Error("Erreur lors de la récupération des données météo Azure");
        
        const currentJson = await currentRes.json();
        const dailyJson = await dailyRes.json();
        
        const current = currentJson.results[0];
        const forecasts = dailyJson.forecasts;
        
        setData({
          current: {
            temp: current.temperature?.value ?? 0,
            humidity: current.relativeHumidity ?? 0,
            windSpeed: current.wind?.speed?.value ?? 0,
            precipitation: current.precipitationSummary?.pastHour?.value ?? 0,
            isDay: current.isDayTime ?? true,
            weatherCode: current.iconCode ?? 0,
          },
          daily: {
            dates: forecasts.map((d: any) => d.date),
            maxTemps: forecasts.map((d: any) => d.temperature?.maximum?.value ?? 0),
            minTemps: forecasts.map((d: any) => d.temperature?.minimum?.value ?? 0),
            uvIndex: forecasts.map((d: any) => d.airAndPollen?.find((p: any) => p.name === 'UVIndex')?.value ?? 0),
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
