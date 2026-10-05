/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GeoLocation,
  WeatherUnits,
  OpenMeteoForecastResponse,
  DailyForecastDay,
  HourlyForecastItem,
  TravelIntelligence,
} from './types/weather';
import {
  POPULAR_DESTINATIONS,
  fetchForecast,
  processDailyForecast,
  processHourlyForecast,
} from './services/openMeteoApi';
import { computeTravelIntelligence } from './utils/travelIntelligence';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { DailyForecastList } from './components/DailyForecastList';
import { ForecastCharts } from './components/ForecastCharts';
import { HourlyTimeline } from './components/HourlyTimeline';
import { TravelIntelligenceView } from './components/TravelIntelligenceView';
import { DayDetailModal } from './components/DayDetailModal';
import { ErrorAlert } from './components/ErrorAlert';
import { LoadingSkeleton } from './components/LoadingSkeleton';

export default function App() {
  // Navigation View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'charts' | 'travel'>('overview');

  // Weather Units
  const [units, setUnits] = useState<WeatherUnits>(() => {
    try {
      const saved = localStorage.getItem('aether_units');
      return saved ? JSON.parse(saved) : { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' };
    } catch {
      return { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' };
    }
  });

  // Selected Location
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(() => {
    try {
      const saved = localStorage.getItem('aether_current_location');
      return saved ? JSON.parse(saved) : POPULAR_DESTINATIONS[0]; // Tokyo default
    } catch {
      return POPULAR_DESTINATIONS[0];
    }
  });

  // Favorite Locations
  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem('aether_favorite_cities');
      return saved ? JSON.parse(saved) : POPULAR_DESTINATIONS.slice(0, 3);
    } catch {
      return POPULAR_DESTINATIONS.slice(0, 3);
    }
  });

  // Forecast Data States
  const [rawForecast, setRawForecast] = useState<OpenMeteoForecastResponse | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastDay[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [travelIntelligence, setTravelIntelligence] = useState<TravelIntelligence | null>(null);

  // Modal for Day Details
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Status & Error
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load Forecast Data
  const loadForecast = useCallback(
    async (loc: GeoLocation, currentUnits: WeatherUnits) => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetchForecast(loc.latitude, loc.longitude, currentUnits);
        const processedDaily = processDailyForecast(response.daily);
        const processedHourly = processHourlyForecast(response.hourly, response.current.time);

        setRawForecast(response);
        setDailyForecast(processedDaily);
        setHourlyForecast(processedHourly);

        if (processedDaily.length > 0 && !selectedDayDate) {
          setSelectedDayDate(processedDaily[0].date);
        }

        // Compute travel intelligence
        const isMetric = currentUnits.temperature === 'celsius';
        const intel = computeTravelIntelligence(
          response.current,
          processedDaily,
          processedHourly,
          isMetric
        );
        setTravelIntelligence(intel);
      } catch (err: unknown) {
        setFetchError(
          err instanceof Error
            ? err.message
            : 'Could not connect to the meteorological service. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Trigger load on location or units change
  useEffect(() => {
    loadForecast(currentLocation, units);
    try {
      localStorage.setItem('aether_current_location', JSON.stringify(currentLocation));
    } catch {
      // ignore
    }
  }, [currentLocation, units, loadForecast]);

  // Unit Toggle handler
  const handleToggleUnits = () => {
    setUnits((prev) => {
      const next: WeatherUnits =
        prev.temperature === 'celsius'
          ? { temperature: 'fahrenheit', windSpeed: 'mph', precipitation: 'inch' }
          : { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' };
      try {
        localStorage.setItem('aether_units', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Toggle favorite
  const handleToggleFavorite = (loc: GeoLocation) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === loc.id);
      const updated = exists ? prev.filter((f) => f.id !== loc.id) : [...prev, loc];
      try {
        localStorage.setItem('aether_favorite_cities', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: GeoLocation = {
          id: Math.round(pos.coords.latitude * 1000 + pos.coords.longitude),
          name: 'My Position',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          admin1: 'Local Coordinates',
          country: 'Current Area',
        };
        setCurrentLocation(userLoc);
      },
      () => {
        setIsLoading(false);
        setFetchError('Unable to retrieve your current location. Please search for a city.');
      },
      { timeout: 10000 }
    );
  };

  // Inspect day detail modal
  const handleSelectDay = (date: string) => {
    setSelectedDayDate(date);
    setIsDayModalOpen(true);
  };

  const selectedDayObj = dailyForecast.find((d) => d.date === selectedDayDate) || dailyForecast[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        units={units}
        onToggleUnits={handleToggleUnits}
        onRefresh={() => loadForecast(currentLocation, units)}
        isLoading={isLoading}
        onUseCurrentLocation={handleUseCurrentLocation}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* City Search & Quick Jump */}
        <section className="space-y-3">
          <CitySearch
            currentLocation={currentLocation}
            onSelectCity={(loc) => {
              setCurrentLocation(loc);
              setSelectedDayDate('');
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

        {/* Error Handling State */}
        {fetchError && (
          <ErrorAlert
            message={fetchError}
            onRetry={() => loadForecast(currentLocation, units)}
            onSelectFallbackCity={(city) => setCurrentLocation(city)}
          />
        )}

        {/* Data Loading Skeleton */}
        {isLoading && !rawForecast && <LoadingSkeleton />}

        {/* Populated Views */}
        {!fetchError && rawForecast && (
          <>
            {/* VIEW TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Current Weather Hero & 6 Telemetry Gauges */}
                <CurrentWeatherHero
                  location={currentLocation}
                  data={rawForecast}
                  todayDaily={dailyForecast[0]}
                  units={units}
                />

                {/* 24-Hour Progression Strip */}
                <HourlyTimeline hourly={hourlyForecast} units={units} />

                {/* Charts Quick Peek */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Atmospheric Dynamics
                    </h2>
                    <button
                      onClick={() => setActiveTab('charts')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      Expand Full Charts →
                    </button>
                  </div>
                  <ForecastCharts hourly={hourlyForecast} units={units} />
                </div>

                {/* 7-Day Outlook Strip */}
                <DailyForecastList
                  daily={dailyForecast}
                  units={units}
                  selectedDate={selectedDayDate}
                  onSelectDay={handleSelectDay}
                />
              </div>
            )}

            {/* VIEW TAB 2: 7-DAY FORECAST */}
            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    Showing 7-day diurnal range and meteorological probabilities for{' '}
                    <strong className="text-white">{currentLocation.name}</strong>.
                  </span>
                  <span className="font-mono text-cyan-400">Tap any day for hour-by-hour telemetry</span>
                </div>

                <DailyForecastList
                  daily={dailyForecast}
                  units={units}
                  selectedDate={selectedDayDate}
                  onSelectDay={handleSelectDay}
                />

                <HourlyTimeline hourly={hourlyForecast} units={units} />
              </div>
            )}

            {/* VIEW TAB 3: ATMOSPHERIC CHARTS */}
            {activeTab === 'charts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Atmospheric Telemetry & Forecast Charts
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-parameter atmospheric modeling including thermal trajectories, precipitation curves, wind gusts, and UV solar intensity.
                  </p>
                </div>

                <ForecastCharts hourly={hourlyForecast} units={units} />

                <HourlyTimeline hourly={hourlyForecast} units={units} />
              </div>
            )}

            {/* VIEW TAB 4: TRAVEL ADVISORY & INTELLIGENCE */}
            {activeTab === 'travel' && travelIntelligence && (
              <TravelIntelligenceView
                location={currentLocation}
                intelligence={travelIntelligence}
                daily={dailyForecast}
                onSelectDay={handleSelectDay}
              />
            )}
          </>
        )}
      </main>

      {/* Day Breakdown Modal */}
      {isDayModalOpen && selectedDayObj && (
        <DayDetailModal
          day={selectedDayObj}
          hourly={hourlyForecast}
          units={units}
          onClose={() => setIsDayModalOpen(false)}
        />
      )}

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-6 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Aether Meteorological Platform</span>
            <span aria-hidden="true">·</span>
            <span>Open-Meteo Geocoding & Forecast API</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>High-precision WMO standards</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Zero-Telemetry Footprint</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
