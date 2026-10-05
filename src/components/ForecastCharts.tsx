import React, { useState } from 'react';
import { HourlyForecastItem, WeatherUnits } from '../types/weather';
import { Thermometer, Droplets, Wind, SunMedium } from 'lucide-react';
import { getWeatherCodeInfo } from '../utils/weatherCodes';

interface ForecastChartsProps {
  hourly: HourlyForecastItem[];
  units: WeatherUnits;
}

type MetricType = 'temperature' | 'precipitation' | 'wind' | 'uv';

export const ForecastCharts: React.FC<ForecastChartsProps> = ({ hourly, units }) => {
  const [metric, setMetric] = useState<MetricType>('temperature');
  const [rangeHours, setRangeHours] = useState<24 | 48>(24);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!hourly || hourly.length === 0) return null;

  const data = hourly.slice(0, rangeHours);
  if (data.length < 2) return null;

  // Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 240;
  const padding = { top: 28, right: 30, bottom: 40, left: 45 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Extract min/max values for active metric
  let minValue = 0;
  let maxValue = 100;
  let unitLabel = '';

  if (metric === 'temperature') {
    const allTemps = data.flatMap((d) => [d.temperature, d.apparentTemperature]);
    minValue = Math.floor(Math.min(...allTemps) - 2);
    maxValue = Math.ceil(Math.max(...allTemps) + 2);
    unitLabel = units.temperature === 'celsius' ? '°C' : '°F';
  } else if (metric === 'precipitation') {
    minValue = 0;
    maxValue = 100; // probability %
    unitLabel = '%';
  } else if (metric === 'wind') {
    minValue = 0;
    const allWinds = data.flatMap((d) => [d.windSpeed]);
    maxValue = Math.max(30, Math.ceil(Math.max(...allWinds) * 1.25));
    unitLabel = units.windSpeed === 'kmh' ? 'km/h' : units.windSpeed === 'mph' ? 'mph' : 'm/s';
  } else if (metric === 'uv') {
    minValue = 0;
    const maxUv = Math.max(...data.map((d) => d.uvIndex));
    maxValue = Math.max(8, Math.ceil(maxUv + 1));
    unitLabel = 'UV';
  }

  const valueRange = Math.max(1, maxValue - minValue);

  // Coordinate mapping functions
  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (value: number) => {
    const clamped = Math.max(minValue, Math.min(maxValue, value));
    const normalized = (clamped - minValue) / valueRange;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // Build SVG path string with cubic bezier smoothing
  const buildSmoothPath = (values: number[]) => {
    const points = values.map((val, i) => ({ x: getX(i), y: getY(val) }));
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Primary Path
  const primaryValues = data.map((d) => {
    if (metric === 'temperature') return d.temperature;
    if (metric === 'precipitation') return d.precipitationProbability;
    if (metric === 'wind') return d.windSpeed;
    return d.uvIndex;
  });

  const primaryPath = buildSmoothPath(primaryValues);

  // Closed area path
  const areaPath = `${primaryPath} L ${getX(data.length - 1)} ${
    padding.top + innerHeight
  } L ${getX(0)} ${padding.top + innerHeight} Z`;

  // Secondary path (Apparent temperature or wind gusts)
  let secondaryPath = '';
  if (metric === 'temperature') {
    secondaryPath = buildSmoothPath(data.map((d) => d.apparentTemperature));
  }

  // Active hovered point details
  const activeIndex = hoveredIndex ?? Math.min(2, data.length - 1);
  const activeItem = data[activeIndex];
  const activeWeather = activeItem ? getWeatherCodeInfo(activeItem.weatherCode) : null;

  // Grid steps
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return Math.round(minValue + (i / gridSteps) * valueRange);
  });

  // X Axis ticks (every 4 or 6 hours)
  const stepHours = rangeHours === 24 ? 3 : 6;
  const timeTicks = data.filter((_, idx) => idx % stepHours === 0);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-6 space-y-5">
      {/* Metric Selectors and Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setMetric('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              metric === 'temperature'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temperature</span>
          </button>

          <button
            onClick={() => setMetric('precipitation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              metric === 'precipitation'
                ? 'bg-slate-800 text-sky-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Precipitation %</span>
          </button>

          <button
            onClick={() => setMetric('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              metric === 'wind'
                ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind Speed</span>
          </button>

          <button
            onClick={() => setMetric('uv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              metric === 'uv'
                ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>UV Radiation</span>
          </button>
        </div>

        {/* Time Window Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setRangeHours(24)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              rangeHours === 24
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setRangeHours(48)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              rangeHours === 48
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            48 Hours
          </button>
        </div>
      </div>

      {/* Active Inspector Banner */}
      {activeItem && (
        <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-cyan-400">
              {activeItem.hourLabel}
            </span>
            <span className="text-slate-500">·</span>
            <span>{activeWeather?.label || 'Clear'}</span>
          </div>

          <div className="flex items-center gap-4 font-mono tabular-nums">
            {metric === 'temperature' && (
              <>
                <span>
                  Temp:{' '}
                  <strong className="text-cyan-300">{activeItem.temperature}°</strong>
                </span>
                <span className="text-slate-400">
                  Feels like:{' '}
                  <strong className="text-slate-200">{activeItem.apparentTemperature}°</strong>
                </span>
              </>
            )}
            {metric === 'precipitation' && (
              <>
                <span>
                  Chance:{' '}
                  <strong className="text-sky-300">{activeItem.precipitationProbability}%</strong>
                </span>
                <span className="text-slate-400">
                  Precip: <strong className="text-slate-200">{activeItem.precipitation} mm</strong>
                </span>
              </>
            )}
            {metric === 'wind' && (
              <>
                <span>
                  Wind:{' '}
                  <strong className="text-teal-300">{activeItem.windSpeed} {unitLabel}</strong>
                </span>
                <span className="text-slate-400">
                  Direction: <strong className="text-slate-200">{activeItem.windDirection}°</strong>
                </span>
              </>
            )}
            {metric === 'uv' && (
              <>
                <span>
                  Index: <strong className="text-amber-300">{activeItem.uvIndex}</strong>
                </span>
                <span className="text-slate-400">
                  Humidity: <strong className="text-slate-200">{activeItem.relativeHumidity}%</strong>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="skyAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="amberAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="tealAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridValues.map((val) => {
            const y = getY(val);
            return (
              <g key={`grid-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={
              metric === 'temperature'
                ? 'url(#cyanAreaGradient)'
                : metric === 'precipitation'
                ? 'url(#skyAreaGradient)'
                : metric === 'uv'
                ? 'url(#amberAreaGradient)'
                : 'url(#tealAreaGradient)'
            }
          />

          {/* Secondary Path (Apparent Temp dashed line) */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.65"
            />
          )}

          {/* Primary Curve Path */}
          <path
            d={primaryPath}
            fill="none"
            stroke={
              metric === 'temperature'
                ? '#22d3ee'
                : metric === 'precipitation'
                ? '#38bdf8'
                : metric === 'uv'
                ? '#fbbf24'
                : '#2dd4bf'
            }
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {data.map((item, idx) => {
            const x = getX(idx);
            const val = primaryValues[idx];
            const y = getY(val);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`pt-${item.time}`} className="cursor-pointer">
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerHeight}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 3}
                  fill={
                    metric === 'temperature'
                      ? '#0891b2'
                      : metric === 'precipitation'
                      ? '#0284c7'
                      : metric === 'uv'
                      ? '#d97706'
                      : '#0d9488'
                  }
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all"
                />

                {/* Invisible hover capture target */}
                <rect
                  x={x - 12}
                  y={padding.top}
                  width="24"
                  height={innerHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {timeTicks.map((item) => {
            const originalIndex = data.findIndex((d) => d.time === item.time);
            if (originalIndex === -1) return null;
            const x = getX(originalIndex);

            return (
              <g key={`time-${item.time}`}>
                <line
                  x1={x}
                  y1={padding.top + innerHeight}
                  x2={x}
                  y2={padding.top + innerHeight + 5}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 18}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {item.hourLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend / Methodology note */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                metric === 'temperature'
                  ? 'bg-cyan-400'
                  : metric === 'precipitation'
                  ? 'bg-sky-400'
                  : metric === 'uv'
                  ? 'bg-amber-400'
                  : 'bg-teal-400'
              }`}
            />
            <span>Active metric: {metric.toUpperCase()}</span>
          </div>

          {metric === 'temperature' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
              <span>Dashed line: Apparent temperature (Feels like)</span>
            </div>
          )}
        </div>

        <span className="font-mono text-[11px]">Hover or tap curve nodes for precise readings</span>
      </div>
    </div>
  );
};
