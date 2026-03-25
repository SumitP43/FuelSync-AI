'use client';

import { useState, useMemo, useEffect } from 'react';
import PumpCard from './PumpCard';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import { pumps, sortPumps } from '../data/pumps';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'waitingTime', label: 'Shortest Wait' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'rating', label: 'Top Rated' },
];

const CROWD_FILTERS = [
  { value: 'all', label: 'All', icon: '🔵' },
  { value: 'low', label: 'Low', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'high', label: 'High', icon: '🔴' },
];

export default function PumpList() {
  const [sortBy, setSortBy] = useState('distance');
  const [crowdFilter, setCrowdFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPumps = useMemo(() => {
    let list = [...pumps];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    // Crowd filter
    if (crowdFilter !== 'all') {
      list = list.filter((p) => p.crowdLevel === crowdFilter);
    }

    // Sort
    list = sortPumps(list, sortBy);

    return list;
  }, [sortBy, crowdFilter, search]);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pumps by name, area, or city..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                sortBy === opt.value
                  ? 'bg-fuel-green/10 text-fuel-green border border-fuel-green/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crowd filter */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Crowd:</span>
          {CROWD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCrowdFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                crowdFilter === f.value
                  ? 'bg-zinc-800 text-white border border-zinc-600'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-zinc-500 text-xs mb-4">
        {isLoading ? '...' : `${filteredPumps.length} stations found`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : filteredPumps.length === 0 ? (
        <EmptyState
          icon="⛽"
          title="No stations found"
          description="Try adjusting your search or filters to find CNG stations."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPumps.map((pump, i) => (
            <PumpCard key={pump.id} pump={pump} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
