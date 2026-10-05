export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type PrecipitationUnit = 'mm' | 'inch';

export interface WeatherUnits {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  precipitation: PrecipitationUnit;
}

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeoLocation[];
  generationtime_ms?: number;
}

export interface OpenMeteoCurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  uv_index: number;
}

export interface OpenMeteoHourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  surface_pressure: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  uv_index: number[];
}

export interface OpenMeteoDailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: OpenMeteoCurrentWeather;
  hourly_units: Record<string, string>;
  hourly: OpenMeteoHourlyWeather;
  daily_units: Record<string, string>;
  daily: OpenMeteoDailyWeather;
}

export interface DailyForecastDay {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  weatherText: string;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  fullTime: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  cloudCover: number;
  visibility: number;
  pressure: number;
  isDaytime: boolean;
}

export interface TravelPackingItem {
  name: string;
  category: 'clothing' | 'protection' | 'footwear' | 'accessories';
  reason: string;
  essential: boolean;
}

export interface ActivityViability {
  activity: string;
  status: 'optimal' | 'moderate' | 'unfavorable';
  score: number; // 0 - 100
  recommendation: string;
  bestWindow?: string;
}

export interface TransitAdvisory {
  type: 'aviation' | 'road' | 'marine' | 'rail';
  riskLevel: 'low' | 'moderate' | 'high';
  title: string;
  advisory: string;
}

export interface TravelIntelligence {
  suitabilityScore: number; // 0 - 100
  verdict: 'Prime Travel Weather' | 'Favorable Conditions' | 'Marginal Conditions' | 'Adverse Weather Advisory';
  executiveSummary: string;
  temperatureComfort: 'Cold / Chilly' | 'Cool & Crisp' | 'Ideal & Mild' | 'Warm & Pleasant' | 'Hot & Muggy' | 'Extreme Heat';
  packingList: TravelPackingItem[];
  activities: ActivityViability[];
  transitAdvisories: TransitAdvisory[];
  bestDays: {
    date: string;
    dayName: string;
    score: number;
    reason: string;
  }[];
  sunSafety: {
    maxUV: number;
    riskTier: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    recommendedProtection: string;
    peakExposureHours: string;
  };
}
