import React from 'react';
import { DailyForecastDay, WeatherUnits, HourlyForecastItem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import {
  X,
  Sunrise,
  Sunset,
  Droplets,
  Wind,
  SunMedium,
  Compass,
  Clock,
} from 'lucide-react';

interface DayDetailModalProps {
  day: DailyForecastDay | null;
  hourly: HourlyForecastItem[];
  units: WeatherUnits;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  hourly,
  units,
  onClose,
}) => {
  if (!day) return null;

  // Filter hourly items belonging to this day
  const dayHourly = hourly.filter((h) => h.time.startsWith(day.date));
  const sunriseTime = day.sunrise ? day.sunrise.slice(11, 16) : '--:--';
  const sunsetTime = day.sunset ? day.sunset.slice(11, 16) : '--:--';

  const windUnit = units.windSpeed === 'kmh' ? 'km/h' : units.windSpeed === 'mph' ? 'mph' : 'm/s';
  const precipUnit = units.precipitation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60">
              <WeatherIcon code={day.weatherCode} isDay={true} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{day.dayName}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  ({day.formattedDate})
                </span>
              </h3>
              <p className="text-xs text-slate-400">{day.weatherText}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Temperature Range Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Diurnal Temperature Spectrum</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  {day.tempMin}°
                </span>
                <span className="text-slate-500 font-mono">to</span>
                <span className="text-2xl font-mono font-bold text-rose-400">
                  {day.tempMax}°
                </span>
                <span className="text-xs text-slate-400 font-mono ml-2">
                  (Apparent: {day.apparentMin}° / {day.apparentMax}°)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Precipitation Max</span>
              <div className="text-xl font-mono font-bold text-sky-400 mt-1">
                {day.precipitationProbabilityMax}%
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400" /> Rain Sum
              </span>
              <div className="font-mono tabular-nums text-slate-200 font-semibold text-sm">
                {day.precipitationSum} {precipUnit}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" /> Max Gusts
              </span>
              <div className="font-mono tabular-nums text-slate-200 font-semibold text-sm">
                {day.windGustsMax} {windUnit}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Max UV Index
              </span>
              <div className="font-mono tabular-nums text-slate-200 font-semibold text-sm">
                {day.uvIndexMax}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" /> Wind Direction
              </span>
              <div className="font-mono tabular-nums text-slate-200 font-semibold text-sm">
                {day.windDirectionDominant}°
              </div>
            </div>
          </div>

          {/* Daylight Tracker */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400">Sunrise: </span>
                <span className="font-mono font-semibold text-slate-200">{sunriseTime}</span>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-slate-400">Sunset: </span>
                <span className="font-mono font-semibold text-slate-200">{sunsetTime}</span>
              </div>
            </div>
          </div>

          {/* Hourly Timeline for this day */}
          {dayHourly.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hourly Curve For {day.dayName}</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
                {dayHourly.map((h) => (
                  <div
                    key={h.time}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 shrink-0 w-16 text-center space-y-1"
                  >
                    <span className="text-[11px] font-mono text-slate-400">{h.hourLabel}</span>
                    <WeatherIcon
                      code={h.weatherCode}
                      isDay={h.isDaytime}
                      className="w-5 h-5 mx-auto"
                    />
                    <span className="text-xs font-mono font-bold text-white block">
                      {h.temperature}°
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 block">
                      {h.precipitationProbability}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
