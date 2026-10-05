import React from 'react';
import { HourlyForecastItem, WeatherUnits } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Wind } from 'lucide-react';

interface HourlyTimelineProps {
  hourly: HourlyForecastItem[];
  units: WeatherUnits;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly, units }) => {
  if (!hourly || hourly.length === 0) return null;

  // Take the first 24 hours
  const next24 = hourly.slice(0, 24);

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Hourly Progression (Next 24h)
        </h3>
        <span className="text-xs text-slate-400">Scroll horizontally for detailed curve</span>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth">
        {next24.map((item, index) => {
          const isNow = index === 0;

          return (
            <div
              key={item.time}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border shrink-0 w-20 sm:w-24 text-center transition-all ${
                isNow
                  ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              {/* Hour time */}
              <span className="text-xs font-semibold text-slate-300 font-mono">
                {isNow ? 'Now' : item.hourLabel}
              </span>

              {/* Weather icon */}
              <div className="my-2.5">
                <WeatherIcon
                  code={item.weatherCode}
                  isDay={item.isDaytime}
                  className="w-6 h-6"
                />
              </div>

              {/* Temperature */}
              <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-white">
                {item.temperature}°
              </span>

              {/* Precipitation % */}
              <div className="flex items-center gap-1 mt-2 text-[11px] font-mono tabular-nums text-slate-400">
                <Droplets
                  className={`w-3 h-3 ${
                    item.precipitationProbability > 25 ? 'text-sky-400' : 'text-slate-600'
                  }`}
                />
                <span
                  className={
                    item.precipitationProbability > 30 ? 'text-sky-300 font-medium' : 'text-slate-400'
                  }
                >
                  {item.precipitationProbability}%
                </span>
              </div>

              {/* Wind Speed */}
              <div className="flex items-center gap-0.5 mt-1 text-[10px] font-mono text-slate-500">
                <Wind className="w-2.5 h-2.5" />
                <span>{item.windSpeed}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
