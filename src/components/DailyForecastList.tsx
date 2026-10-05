import React from 'react';
import { DailyForecastDay, WeatherUnits } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Wind, SunMedium, ChevronRight } from 'lucide-react';

interface DailyForecastListProps {
  daily: DailyForecastDay[];
  units: WeatherUnits;
  selectedDate: string;
  onSelectDay: (date: string) => void;
}

export const DailyForecastList: React.FC<DailyForecastListProps> = ({
  daily,
  units,
  selectedDate,
  onSelectDay,
}) => {
  if (!daily || daily.length === 0) return null;

  // Calculate week-wide min and max to normalize visual range bars
  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const rangeSpan = Math.max(1, weekMax - weekMin);

  const windUnit = units.windSpeed === 'kmh' ? 'km/h' : units.windSpeed === 'mph' ? 'mph' : 'm/s';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            7-Day Meteorological Outlook
          </h2>
          <p className="text-xs text-slate-400">
            Select any day to inspect atmospheric progression and travel viability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {daily.map((day) => {
          const isSelected = day.date === selectedDate;
          
          // Calculate bar offsets (percent)
          const leftPercent = Math.max(0, Math.min(95, ((day.tempMin - weekMin) / rangeSpan) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((day.tempMax - weekMin) / rangeSpan) * 100));
          const barWidthPercent = Math.max(8, rightPercent - leftPercent);

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day.date)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Day Name, Date & Condition Icon */}
              <div className="flex items-center gap-3 sm:w-56 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                  <WeatherIcon code={day.weatherCode} isDay={true} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">
                      {day.dayName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {day.formattedDate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[140px]">
                    {day.weatherText}
                  </div>
                </div>
              </div>

              {/* Rain Chance & Wind Summary */}
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-400 sm:w-48 shrink-0">
                <div className="flex items-center gap-1.5" title="Precipitation Probability">
                  <Droplets
                    className={`w-3.5 h-3.5 ${
                      day.precipitationProbabilityMax > 30 ? 'text-sky-400' : 'text-slate-600'
                    }`}
                  />
                  <span
                    className={
                      day.precipitationProbabilityMax > 50
                        ? 'text-sky-300 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {day.precipitationProbabilityMax}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5" title="Max Wind Speed">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {day.windSpeedMax} {windUnit}
                  </span>
                </div>

                <div className="hidden lg:flex items-center gap-1" title="Peak UV Index">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500/70" />
                  <span>UV {day.uvIndexMax}</span>
                </div>
              </div>

              {/* Normalized Temperature Range Bar */}
              <div className="flex items-center gap-3 w-full sm:max-w-xs shrink-0">
                <span className="text-xs font-mono tabular-nums text-cyan-400 font-semibold w-8 text-right shrink-0">
                  {day.tempMin}°
                </span>

                {/* Range Track */}
                <div className="relative flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-mono tabular-nums text-rose-400 font-semibold w-8 shrink-0">
                  {day.tempMax}°
                </span>

                <ChevronRight
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    isSelected ? 'text-cyan-400 rotate-90 sm:rotate-0' : ''
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
