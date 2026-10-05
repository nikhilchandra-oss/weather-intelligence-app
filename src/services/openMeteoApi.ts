import {
  GeocodingResponse,
  GeoLocation,
  OpenMeteoForecastResponse,
  WeatherUnits,
  DailyForecastDay,
  HourlyForecastItem,
} from '../types/weather';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

export const POPULAR_DESTINATIONS: GeoLocation[] = [
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    elevation: 40,
    country_code: 'JP',
    country: 'Japan',
    admin1: 'Tokyo Prefecture',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2657896,
    name: 'Zurich',
    latitude: 47.3667,
    longitude: 8.55,
    elevation: 408,
    country_code: 'CH',
    country: 'Switzerland',
    admin1: 'Zurich',
    timezone: 'Europe/Zurich',
  },
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7143,
    longitude: -74.006,
    elevation: 10,
    country_code: 'US',
    country: 'United States',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    elevation: 35,
    country_code: 'FR',
    country: 'France',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
  {
    id: 1880252,
    name: 'Singapore',
    latitude: 1.2897,
    longitude: 103.8501,
    elevation: 15,
    country_code: 'SG',
    country: 'Singapore',
    admin1: 'Central Singapore',
    timezone: 'Asia/Singapore',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.8678,
    longitude: 151.2073,
    elevation: 58,
    country_code: 'AU',
    country: 'Australia',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
  {
    id: 360630,
    name: 'Cairo',
    latitude: 30.0626,
    longitude: 31.2497,
    elevation: 23,
    country_code: 'EG',
    country: 'Egypt',
    admin1: 'Cairo',
    timezone: 'Africa/Cairo',
  },
  {
    id: 5391959,
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    elevation: 16,
    country_code: 'US',
    country: 'United States',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
  },
];

/**
 * Searches cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding server responded with status ${res.status}`);
    }
    const data: GeocodingResponse = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }
    return data.results;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to reach geocoding service. Please check your network connection.');
  }
}

/**
 * Fetches current weather and 7-day forecast using Open-Meteo Forecast API
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  units: WeatherUnits
): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'rain_sum',
      'showers_sum',
      'snowfall_sum',
      'precipitation_hours',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: 'auto',
    temperature_unit: units.temperature,
    wind_speed_unit: units.windSpeed,
    precipitation_unit: units.precipitation,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather forecast service returned status ${res.status}`);
    }
    const data: OpenMeteoForecastResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to retrieve forecast data. Please check your network connection.');
  }
}

/**
 * Normalizes daily forecast raw arrays into structured DailyForecastDay objects
 */
export function processDailyForecast(daily: OpenMeteoForecastResponse['daily']): DailyForecastDay[] {
  if (!daily || !daily.time) return [];

  const days: DailyForecastDay[] = [];
  const count = daily.time.length;

  for (let i = 0; i < count; i++) {
    const dateStr = daily.time[i];
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    
    // Day name (e.g., Today, Tomorrow, Wed)
    let dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    if (i === 0) dayName = 'Today';
    else if (i === 1) dayName = 'Tomorrow';

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const weatherCode = daily.weather_code[i] ?? 0;
    const weatherInfo = getWeatherCodeInfo(weatherCode);

    days.push({
      date: dateStr,
      dayName,
      formattedDate,
      weatherCode,
      weatherText: weatherInfo.label,
      tempMax: Math.round(daily.temperature_2m_max[i] ?? 0),
      tempMin: Math.round(daily.temperature_2m_min[i] ?? 0),
      apparentMax: Math.round(daily.apparent_temperature_max[i] ?? 0),
      apparentMin: Math.round(daily.apparent_temperature_min[i] ?? 0),
      sunrise: daily.sunrise[i] ?? '',
      sunset: daily.sunset[i] ?? '',
      uvIndexMax: Math.round((daily.uv_index_max[i] ?? 0) * 10) / 10,
      precipitationSum: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
      precipitationProbabilityMax: Math.round(daily.precipitation_probability_max[i] ?? 0),
      windSpeedMax: Math.round(daily.wind_speed_10m_max[i] ?? 0),
      windGustsMax: Math.round(daily.wind_gusts_10m_max[i] ?? 0),
      windDirectionDominant: Math.round(daily.wind_direction_10m_dominant[i] ?? 0),
    });
  }

  return days;
}

/**
 * Normalizes hourly forecast raw arrays into structured HourlyForecastItem objects
 */
export function processHourlyForecast(
  hourly: OpenMeteoForecastResponse['hourly'],
  currentIsoTime?: string
): HourlyForecastItem[] {
  if (!hourly || !hourly.time) return [];

  const items: HourlyForecastItem[] = [];
  const count = hourly.time.length;

  // Find index closest to current time, or start from 0
  let startIndex = 0;
  if (currentIsoTime) {
    const currentPrefix = currentIsoTime.slice(0, 13); // "YYYY-MM-DDTHH"
    const matchIndex = hourly.time.findIndex((t) => t.startsWith(currentPrefix));
    if (matchIndex !== -1) {
      startIndex = matchIndex;
    }
  }

  // Extract up to 48 hours from current
  const sliceEnd = Math.min(count, startIndex + 48);

  for (let i = startIndex; i < sliceEnd; i++) {
    const timeStr = hourly.time[i];
    const hourPart = timeStr.slice(11, 16); // "14:00"
    const hourNum = parseInt(timeStr.slice(11, 13), 10);
    const isDaytime = hourNum >= 6 && hourNum < 20;

    items.push({
      time: timeStr,
      hourLabel: hourPart,
      fullTime: timeStr,
      temperature: Math.round(hourly.temperature_2m[i] ?? 0),
      apparentTemperature: Math.round(hourly.apparent_temperature[i] ?? 0),
      relativeHumidity: Math.round(hourly.relative_humidity_2m[i] ?? 0),
      dewPoint: Math.round(hourly.dew_point_2m[i] ?? 0),
      precipitationProbability: Math.round(hourly.precipitation_probability[i] ?? 0),
      precipitation: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
      weatherCode: hourly.weather_code[i] ?? 0,
      windSpeed: Math.round(hourly.wind_speed_10m[i] ?? 0),
      windDirection: Math.round(hourly.wind_direction_10m[i] ?? 0),
      uvIndex: Math.round((hourly.uv_index[i] ?? 0) * 10) / 10,
      cloudCover: Math.round(hourly.cloud_cover[i] ?? 0),
      visibility: Math.round((hourly.visibility[i] ?? 10000) / 1000), // in km
      pressure: Math.round(hourly.surface_pressure[i] ?? 1013),
      isDaytime,
    });
  }

  return items;
}
