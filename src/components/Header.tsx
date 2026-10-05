import React from 'react';
import { Compass, RotateCw, Sparkles, MapPin } from 'lucide-react';
import { WeatherUnits } from '../types/weather';

interface HeaderProps {
  activeTab: 'overview' | 'forecast' | 'charts' | 'travel';
  onTabChange: (tab: 'overview' | 'forecast' | 'charts' | 'travel') => void;
  units: WeatherUnits;
  onToggleUnits: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onUseCurrentLocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  units,
  onToggleUnits,
  onRefresh,
  isLoading,
  onUseCurrentLocation,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <span className="text-base sm:text-lg font-bold tracking-tight text-white">
          Aether Intelligence
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('forecast')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'forecast'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          7-Day Forecast
        </button>
        <button
          onClick={() => onTabChange('charts')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'charts'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          Atmospheric Charts
        </button>
        <button
          onClick={() => onTabChange('travel')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'travel'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Travel Advisory</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Locate Me button */}
        <button
          onClick={onUseCurrentLocation}
          title="Use GPS current location"
          className="p-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">My Location</span>
        </button>

        {/* Unit Toggle */}
        <button
          onClick={onToggleUnits}
          title="Toggle Metric (°C, km/h) / Imperial (°F, mph)"
          className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 tabular-nums"
        >
          <span className={units.temperature === 'celsius' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
            °C
          </span>
          <span className="text-slate-600">/</span>
          <span className={units.temperature === 'fahrenheit' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
            °F
          </span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh forecast data"
          className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
