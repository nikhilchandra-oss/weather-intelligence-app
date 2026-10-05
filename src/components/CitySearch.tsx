import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Star, Clock, AlertCircle } from 'lucide-react';
import { GeoLocation } from '../types/weather';
import { searchCities, POPULAR_DESTINATIONS } from '../services/openMeteoApi';

interface CitySearchProps {
  currentLocation: GeoLocation;
  onSelectCity: (location: GeoLocation) => void;
  favorites: GeoLocation[];
  onToggleFavorite: (location: GeoLocation) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  currentLocation,
  onSelectCity,
  favorites,
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem('aether_recent_cities');
      return saved ? JSON.parse(saved) : POPULAR_DESTINATIONS.slice(0, 4);
    } catch {
      return POPULAR_DESTINATIONS.slice(0, 4);
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const found = await searchCities(trimmed);
        setResults(found);
        if (found.length === 0) {
          setSearchError(`No locations found matching "${trimmed}".`);
        }
      } catch (err: unknown) {
        setSearchError(
          err instanceof Error
            ? err.message
            : 'Unable to reach the geocoding service. Please check network connection.'
        );
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSelect = (loc: GeoLocation) => {
    onSelectCity(loc);
    setIsOpen(false);
    setQuery('');

    // Save to recents
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== loc.id);
      const updated = [loc, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('aether_recent_cities', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const isFavorite = favorites.some((f) => f.id === currentLocation.id);

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search world cities, regions, or coordinates (e.g., Tokyo, Zurich, Aspen)..."
          className="w-full pl-10 pr-24 py-2.5 bg-slate-900/90 text-sm text-slate-100 placeholder:text-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 shadow-inner transition-all"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearchError(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onToggleFavorite(currentLocation)}
            className={`p-1.5 rounded-md transition-colors ${
              isFavorite
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
          {/* Active Geocoding Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Geocoding Results
              </div>
              <div className="space-y-0.5 mt-1">
                {results.map((loc) => (
                  <button
                    key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                    onClick={() => handleSelect(loc)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="truncate">
                        <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {loc.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0 ml-3">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Error / Not Found handling */}
          {searchError && query.trim().length >= 2 && !isLoading && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 mb-2">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-slate-200">{searchError}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Verify city spelling, search for the nearest capital or metropolitan center, or pick from popular hubs below.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                {POPULAR_DESTINATIONS.slice(0, 5).map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleSelect(dest)}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorites (if available and no active query) */}
          {!query && favorites.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Starred Destinations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {favorites.map((fav) => (
                  <button
                    key={`fav-${fav.id}`}
                    onClick={() => handleSelect(fav)}
                    className="flex items-center justify-between px-3 py-1.5 text-left rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {fav.name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 shrink-0">
                      {fav.country_code || fav.country}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches / Popular Presets (when query is empty) */}
          {!query && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Popular & Recent Explorations</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1.5">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={`popular-${dest.id}`}
                    onClick={() => handleSelect(dest)}
                    className="flex flex-col text-left px-2.5 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 transition-all hover:border-slate-700"
                  >
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {dest.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {dest.country}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
