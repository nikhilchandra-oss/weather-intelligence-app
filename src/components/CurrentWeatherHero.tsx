import React from 'react';
import {
  Wind,
  Droplets,
  SunMedium,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
  Navigation,
  CloudSun,
} from 'lucide-react';
import {
  GeoLocation,
  OpenMeteoForecastResponse,
  WeatherUnits,
  DailyForecastDay,
} from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { getWeatherCodeInfo, getUVTier } from '../utils/weatherCodes';

interface CurrentWeatherHeroProps {
  location: GeoLocation;
  data: OpenMeteoForecastResponse;
  todayDaily?: DailyForecastDay;
  units: WeatherUnits;
}

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  location,
  data,
  todayDaily,
  units,
}) => {
  const current = data.current;
  const weatherInfo = getWeatherCodeInfo(current.weather_code);
  const uvInfo = getUVTier(current.uv_index);

  // Compass direction name from degrees
  const getWindDirectionName = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index] || 'N';
  };

  const windDirName = getWindDirectionName(current.wind_direction_10m);

  // Time formatter
  const formattedTime = new Date(current.time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const sunriseTime = todayDaily?.sunrise ? todayDaily.sunrise.slice(11, 16) : '--:--';
  const sunsetTime = todayDaily?.sunset ? todayDaily.sunset.slice(11, 16) : '--:--';

  const tempUnitSymbol = units.temperature === 'celsius' ? '°C' : '°F';
  const windUnitSymbol = units.windSpeed === 'kmh' ? 'km/h' : units.windSpeed === 'mph' ? 'mph' : 'm/s';

  // Atmospheric moisture description
  const getHumidityComfort = (humidity: number) => {
    if (humidity < 30) return 'Very Dry';
    if (humidity < 55) return 'Comfortable';
    if (humidity < 70) return 'Humid';
    return 'Muggy / High Moisture';
  };

  return (
    <div className="space-y-4">
      {/* Primary Hero Atmosphere Display */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 p-5 sm:p-7 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Location & Condition Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 tracking-wide">
                {location.country || location.country_code}
              </span>
              <span aria-hidden="true">·</span>
              <span>{location.admin1 || 'Regional Center'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-500">
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-3">
              <span>{location.name}</span>
              {location.elevation !== undefined && (
                <span className="text-xs font-mono text-slate-400 font-normal">
                  {location.elevation}m ASL
                </span>
              )}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                <WeatherIcon
                  code={current.weather_code}
                  isDay={current.is_day}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-100">
                  {weatherInfo.label}
                </div>
                <div className="text-xs text-slate-400 max-w-sm">
                  {weatherInfo.advice}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Thermal Telemetry Big Counter */}
          <div className="flex flex-col md:items-end justify-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="flex items-start">
              <span className="text-5xl sm:text-7xl font-extrabold font-mono tabular-nums tracking-tight text-white">
                {Math.round(current.temperature_2m)}
              </span>
              <span className="text-2xl sm:text-3xl font-light text-cyan-400 ml-1 mt-1">
                {tempUnitSymbol}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 mt-1">
              <span>
                Feels like{' '}
                <strong className="font-mono tabular-nums text-slate-200">
                  {Math.round(current.apparent_temperature)}
                  {tempUnitSymbol}
                </strong>
              </span>
              {todayDaily && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="flex items-center text-rose-400 font-mono tabular-nums">
                    <ArrowUp className="w-3 h-3 mr-0.5 inline" />
                    {todayDaily.tempMax}°
                  </span>
                  <span className="flex items-center text-cyan-400 font-mono tabular-nums">
                    <ArrowDown className="w-3 h-3 mr-0.5 inline" />
                    {todayDaily.tempMin}°
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono mt-2">
              Updated {formattedTime} · {data.timezone}
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Telemetry Grid - 6 High-Density Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Wind & Gusts */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Wind & Flow</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {Math.round(current.wind_speed_10m)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{windUnitSymbol}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
              <Navigation
                className="w-3 h-3 text-cyan-400 shrink-0"
                style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
              />
              <span className="font-mono tabular-nums">{windDirName} ({Math.round(current.wind_direction_10m)}°)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            Gusts: {Math.round(current.wind_gusts_10m)} {windUnitSymbol}
          </div>
        </div>

        {/* 2. Humidity & Dew point */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {Math.round(current.relative_humidity_2m)}
              </span>
              <span className="text-xs text-slate-400 font-medium">%</span>
            </div>
            <div className="text-xs text-slate-300 truncate mt-0.5">
              {getHumidityComfort(current.relative_humidity_2m)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            Precip: {current.precipitation} {units.precipitation}
          </div>
        </div>

        {/* 3. UV Index & Solar Protection */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">UV Radiation</span>
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {current.uv_index.toFixed(1)}
              </span>
              <span className={`text-xs font-semibold ${uvInfo.color}`}>
                {uvInfo.tier}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {todayDaily ? `Peak ~${todayDaily.uvIndexMax}` : 'Current reading'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {current.uv_index >= 5 ? 'Sunscreen advised' : 'Low skin hazard'}
          </div>
        </div>

        {/* 4. Barometric Pressure */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {Math.round(current.pressure_msl || current.surface_pressure)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">hPa</span>
            </div>
            <div className="text-xs text-slate-300 truncate mt-0.5">
              {current.pressure_msl > 1015 ? 'High Barometer' : current.pressure_msl < 1005 ? 'Low Barometer' : 'Normal Gradient'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            Surface: {Math.round(current.surface_pressure)} hPa
          </div>
        </div>

        {/* 5. Cloud Cover & Daylight */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Cloud Ceiling</span>
            <CloudSun className="w-3.5 h-3.5 text-blue-300" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {Math.round(current.cloud_cover)}
              </span>
              <span className="text-xs text-slate-400 font-medium">%</span>
            </div>
            <div className="text-xs text-slate-300 truncate mt-0.5">
              {current.cloud_cover < 20 ? 'Clear Sky' : current.cloud_cover < 60 ? 'Scattered' : 'Heavy Cover'}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {current.is_day ? 'Daylight hours' : 'Night period'}
          </div>
        </div>

        {/* 6. Sun Horizon Tracker */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Sun Horizon</span>
            <Sunset className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Sunrise className="w-3 h-3 text-amber-400" /> Rise
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {sunriseTime}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Sunset className="w-3 h-3 text-orange-400" /> Set
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {sunsetTime}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Golden hours active
          </div>
        </div>
      </div>
    </div>
  );
};
