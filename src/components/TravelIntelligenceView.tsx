import React from 'react';
import {
  TravelIntelligence,
  DailyForecastDay,
  GeoLocation,
} from '../types/weather';
import {
  Sparkles,
  Luggage,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Car,
  Camera,
  UtensilsCrossed,
  Footprints,
  Mountain,
  Building2,
  ShieldCheck,
  Sun,
} from 'lucide-react';

interface TravelIntelligenceViewProps {
  location: GeoLocation;
  intelligence: TravelIntelligence;
  daily: DailyForecastDay[];
  onSelectDay: (date: string) => void;
}

export const TravelIntelligenceView: React.FC<TravelIntelligenceViewProps> = ({
  location,
  intelligence,
  daily,
  onSelectDay,
}) => {
  const {
    suitabilityScore,
    verdict,
    executiveSummary,
    packingList,
    activities,
    transitAdvisories,
    bestDays,
    sunSafety,
  } = intelligence;

  // Score color formatting
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (score >= 45) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getActivityIcon = (name: string) => {
    if (name.includes('Walking')) return <Footprints className="w-4 h-4 text-cyan-400" />;
    if (name.includes('Dining')) return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
    if (name.includes('Hiking')) return <Mountain className="w-4 h-4 text-emerald-400" />;
    if (name.includes('Photography')) return <Camera className="w-4 h-4 text-purple-400" />;
    return <Building2 className="w-4 h-4 text-sky-400" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary & Suitability Score Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Travel Intelligence Analysis · {location.name}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {verdict}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {executiveSummary}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span>Comfort: <strong className="text-slate-200">{intelligence.temperatureComfort}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Max UV: <strong className="text-slate-200">{sunSafety.maxUV} ({sunSafety.riskTier})</strong></span>
              <span aria-hidden="true">·</span>
              <span>Advisories: <strong className="text-slate-200">{transitAdvisories.filter(a => a.riskLevel !== 'low').length} Active</strong></span>
            </div>
          </div>

          {/* Travel Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 shrink-0 w-full md:w-44 text-center">
            <span className="text-xs font-medium text-slate-400 mb-1">
              Travel Suitability Index
            </span>
            <div
              className={`w-20 h-20 rounded-full border-2 flex items-center justify-center font-mono font-extrabold text-3xl tabular-nums my-1 shadow-inner ${getScoreColor(
                suitabilityScore
              )}`}
            >
              {suitabilityScore}
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1">Scale: 0 to 100</span>
          </div>
        </div>
      </div>

      {/* 2. Top Exploration Windows in the 7-Day Horizon */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Optimal Travel Windows (Next 7 Days)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {bestDays.slice(0, 3).map((d, index) => {
            const dayObj = daily.find((item) => item.date === d.date);

            return (
              <button
                key={d.date}
                onClick={() => onSelectDay(d.date)}
                className="text-left p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {d.dayName} {index === 0 && <span className="text-[10px] text-cyan-400 uppercase font-mono ml-1 font-bold">Top Pick</span>}
                  </span>
                  <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Score: {d.score}/100
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-normal mb-2">
                  {d.reason}
                </p>

                {dayObj && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>Range: {dayObj.tempMin}° / {dayObj.tempMax}°</span>
                    <span>Rain: {dayObj.precipitationProbabilityMax}%</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Packing & Gear Checklist */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Luggage className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Weather-Tailored Packing & Wardrobe
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {packingList.filter((i) => i.essential).length} Essentials
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {packingList.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5"
            >
              <div className="mt-0.5 shrink-0">
                {item.essential ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {item.name}
                  </span>
                  {item.essential && (
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Must Pack
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Activity Viability Matrix */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Activity Viability Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activities.map((act) => {
            const isOpt = act.status === 'optimal';
            const isMod = act.status === 'moderate';

            return (
              <div
                key={act.activity}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                    {getActivityIcon(act.activity)}
                    <span>{act.activity}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      isOpt
                        ? 'text-emerald-400'
                        : isMod
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isOpt ? 'Optimal' : isMod ? 'Moderate' : 'Unfavorable'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  {act.recommendation}
                </p>

                {act.bestWindow && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/50">
                    <span className="text-slate-500">Best Window:</span>
                    <span className="text-cyan-300 font-medium">{act.bestWindow}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Transit, Aviation & Environmental Hazards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transit Advisories */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Plane className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Transit & Aviation Intelligence
            </h4>
          </div>

          <div className="space-y-2">
            {transitAdvisories.map((adv) => {
              const isHigh = adv.riskLevel === 'high';
              const isMod = adv.riskLevel === 'moderate';

              return (
                <div
                  key={adv.title}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      {adv.type === 'aviation' ? (
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{adv.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        isHigh
                          ? 'text-rose-400'
                          : isMod
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {adv.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {adv.advisory}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sun, Radiation & Daylight Advisory */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Sun className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Solar Radiation & Skin Safety
            </h4>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Peak Solar Index
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                Index {sunSafety.maxUV} · {sunSafety.riskTier} Risk
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              {sunSafety.recommendedProtection}
            </p>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/50">
              <span>Peak Radiation Window:</span>
              <span className="text-amber-300 font-semibold">{sunSafety.peakExposureHours}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-xs font-semibold text-slate-300">
              Hydration & Heat Stress Protocol
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {intelligence.temperatureComfort === 'Cold / Chilly'
                ? 'Cold air accelerates dry skin and dehydration. Consume hot warm fluids and protect extremities.'
                : intelligence.temperatureComfort === 'Hot & Muggy' || intelligence.temperatureComfort === 'Extreme Heat'
                ? 'Elevated dew points and solar heat load demand at least 2.5L electrolyte water during pedestrian sightseeing.'
                : 'Mild atmospheric comfort. Standard travel hydration sufficient for normal city itineraries.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
