import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-slate-800 rounded-md w-36" />
            <div className="h-8 bg-slate-800 rounded-lg w-64" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl" />
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-800 rounded w-28" />
                <div className="h-3 bg-slate-800 rounded w-48" />
              </div>
            </div>
          </div>
          <div className="space-y-2 md:text-right">
            <div className="h-14 bg-slate-800 rounded-xl w-32 ml-auto" />
            <div className="h-4 bg-slate-800 rounded w-40 ml-auto" />
          </div>
        </div>
      </div>

      {/* 6 gauges skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 space-y-2"
          >
            <div className="h-3 bg-slate-800 rounded w-16" />
            <div className="h-6 bg-slate-800 rounded w-20" />
            <div className="h-2.5 bg-slate-800 rounded w-14" />
          </div>
        ))}
      </div>

      {/* 7-day cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-900/60 border border-slate-800"
          />
        ))}
      </div>
    </div>
  );
};
