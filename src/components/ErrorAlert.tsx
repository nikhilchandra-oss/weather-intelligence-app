import React from 'react';
import { AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../services/openMeteoApi';
import { GeoLocation } from '../types/weather';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onSelectFallbackCity?: (city: GeoLocation) => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Meteorological Data Error',
  message,
  onRetry,
  onSelectFallbackCity,
}) => {
  return (
    <div className="rounded-2xl bg-rose-950/20 border border-rose-800/50 p-6 sm:p-8 text-center max-w-2xl mx-auto my-6 shadow-xl">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-slate-100 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all shadow-sm mb-6"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Meteorological Connection</span>
        </button>
      )}

      {onSelectFallbackCity && (
        <div className="pt-5 border-t border-rose-900/40">
          <p className="text-xs font-medium text-slate-400 mb-3">
            Or select a verified global weather station:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => (
              <button
                key={dest.id}
                onClick={() => onSelectFallbackCity(dest)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
