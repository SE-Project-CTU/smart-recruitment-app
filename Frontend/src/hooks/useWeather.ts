import { useQuery } from "@tanstack/react-query";
import {
  Sun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WeatherData {
  temp: number;
  weatherCode: number;
  city: string;
}

export interface WeatherInfo {
  label: string;
  icon: string;
  LucideIcon: LucideIcon;
}

export function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0) {
    return { label: "Nắng đẹp", icon: "☀️", LucideIcon: Sun };
  }
  if (code >= 1 && code <= 3) {
    return { label: "Nhiều mây", icon: "⛅", LucideIcon: CloudSun };
  }
  if (code >= 45 && code <= 48) {
    return { label: "Sương mù", icon: "🌫️", LucideIcon: CloudFog };
  }
  if (code >= 51 && code <= 67) {
    return { label: "Mưa nhẹ", icon: "🌧️", LucideIcon: CloudDrizzle };
  }
  if (code >= 80 && code <= 82) {
    return { label: "Mưa rào", icon: "🌦️", LucideIcon: CloudRain };
  }
  if (code >= 95) {
    return { label: "Dông bão", icon: "🌩️", LucideIcon: CloudLightning };
  }
  return { label: "Thời tiết tốt", icon: "🌤️", LucideIcon: Cloud };
}

async function fetchWeatherFromApi(): Promise<WeatherData> {
  let lat = 10.8231; // Mặc định TP.HCM
  let lon = 106.6297;
  let city = "TP. Hồ Chí Minh";

  try {
    const ipRes = await fetch("https://freeipapi.com/api/json");
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.latitude && ipData.longitude) {
        lat = ipData.latitude;
        lon = ipData.longitude;
        city = ipData.cityName || ipData.regionName || city;
      }
    }
  } catch {
    // Không lấy được IP thì dùng tọa độ mặc định
  }

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
  );
  if (!weatherRes.ok) {
    throw new Error("Failed to fetch weather from Open-Meteo");
  }

  const weatherData = await weatherRes.json();
  return {
    temp: Math.round(weatherData.current_weather?.temperature ?? 28),
    weatherCode: weatherData.current_weather?.weathercode ?? 0,
    city,
  };
}

export function useWeather() {
  const { data, isLoading } = useQuery({
    queryKey: ["weather", "current"],
    queryFn: fetchWeatherFromApi,
    staleTime: 30 * 60 * 1000, // 30 phút mới fetch lại
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    temp: data?.temp ?? 28,
    weatherCode: data?.weatherCode ?? 0,
    city: data?.city ?? "Việt Nam",
    isLoading,
  };
}
