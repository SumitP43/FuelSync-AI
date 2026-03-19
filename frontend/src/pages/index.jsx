import Head from 'next/head';
import Link from 'next/link';
import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import useLocation from '../hooks/useLocation';
import usePumps from '../hooks/usePumps';
import useRecommendations from '../hooks/useRecommendations';
import PumpCard from '../components/PumpCard';
import RecommendationList from '../components/RecommendationList';
import VoiceAssistant from '../components/VoiceAssistant';
import CrowdReportModal from '../components/CrowdReportModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatWaitTime, getCrowdInfo } from '../utils/helpers';

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const { pumps, loading: pumpsLoading, refetch: refetchPumps } = usePumps(location);
  const { recommendations, loading: recsLoading, refetch: refetchRecs } = useRecommendations(location);

  const [selectedPump, setSelectedPump] = useState(null);
  const [crowdModalPump, setCrowdModalPump] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'list' | 'recs'
  const [searchFilter, setSearchFilter] = useState('');
  const [crowdFilter, setCrowdFilter] = useState('all'); // 'all' | 'low' | 'medium' | 'high'
  const [voiceStatus, setVoiceStatus] = useState('');

  // Filter pumps based on search and crowd filter
  const filteredPumps = useMemo(() => {
    return pumps.filter((pump) => {
      const matchesSearch =
        !searchFilter ||
        pump.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        pump.city?.toLowerCase().includes(searchFilter.toLowerCase());

      const level = pump.current_crowd_level || 2;
      const matchesCrowd =
        crowdFilter === 'all' ||
        (crowdFilter === 'low' && level <= 2) ||
        (crowdFilter === 'medium' && level === 3) ||
        (crowdFilter === 'high' && level >= 4);

      return matchesSearch && matchesCrowd;
    });
  }, [pumps, searchFilter, crowdFilter]);

  // Handle voice commands
  const handleVoiceCommand = useCallback((action, transcript) => {
    if (action === 'low_crowd') {
      setCrowdFilter('low');
      setActiveTab('list');
      setVoiceStatus('🟢 Showing low crowd pumps');
    } else if (action === 'nearest') {
      setCrowdFilter('all');
      setActiveTab('list');
      setVoiceStatus('📍 Showing nearest pumps');
    } else if (action === 'best' || action === 'recommendations') {
      setActiveTab('recs');
      setVoiceStatus('🏆 Showing AI recommendations');
    } else if (action === 'best_time') {
      if (recommendations[0]) setSelectedPump(recommendations[0]);
      setActiveTab('map');
      setVoiceStatus('⏰ Check the prediction graph for best time');
    }
  }, [recommendations]);

  // Stats bar
  const stats = useMemo(() => {
    if (!pumps.length) return null;
    const lowCrowd = pumps.filter((p) => (p.current_crowd_level || 2) <= 2).length;
    const avgWait = Math.round(pumps.reduce((s, p) => s + (p.historical_avg_wait || 20), 0) / pumps.length);
    return { total: pumps.length, lowCrowd, avgWait };
  }, [pumps]);

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Detecting your location..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>FuelSync AI – Smart CNG Pump Finder</title>
        <meta name="description" content="AI-powered CNG pump recommendation system with real-time crowd data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-white text-sm">
                ⛽
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-none">FuelSync AI</h1>
                <p className="text-slate-400 text-xs">Smart CNG Finder</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link href="/recommendations" className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block">
                🏆 Recommendations
              </Link>
              <Link href="/my-favorites" className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block">
                ❤️ Favorites
              </Link>
              <Link href="/settings" className="text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                ⚙️
              </Link>
            </nav>
          </div>
        </header>

        {/* Stats bar */}
        {stats && (
          <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs text-slate-400 overflow-x-auto">
              <span>📍 {stats.total} pumps nearby</span>
              <span>🟢 {stats.lowCrowd} low crowd</span>
              <span>⏱ Avg wait: {formatWaitTime(stats.avgWait)}</span>
              {locationError && <span className="text-yellow-500">⚠️ Using default location</span>}
            </div>
          </div>
        )}

        {/* Voice status */}
        {voiceStatus && (
          <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2 text-center text-green-400 text-sm animate-pulse">
            {voiceStatus}
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-0">
          {/* Sidebar */}
          <div className="lg:w-96 lg:min-w-[384px] flex flex-col border-r border-slate-800">
            {/* Mobile tabs */}
            <div className="flex border-b border-slate-800 lg:hidden">
              {['map', 'list', 'recs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-slate-400'
                  }`}
                >
                  {tab === 'map' ? '🗺️ Map' : tab === 'list' ? '📋 Pumps' : '🧠 AI'}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="p-3 space-y-2 border-b border-slate-800">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="🔍 Search pumps..."
                className="input-field text-sm"
              />
              <div className="flex gap-1.5">
                {['all', 'low', 'medium', 'high'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setCrowdFilter(f)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      crowdFilter === f
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'low' ? '🟢 Low' : f === 'medium' ? '🟡 Med' : '🔴 High'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pump List */}
            <div className={`flex-1 overflow-y-auto ${activeTab === 'list' || window?.innerWidth >= 1024 ? 'block' : 'hidden lg:block'}`}>
              {pumpsLoading ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner text="Finding nearby pumps..." />
                </div>
              ) : filteredPumps.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <div className="text-4xl mb-2">⛽</div>
                  <p>No pumps found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="p-2 space-y-1.5">
                  {filteredPumps.map((pump) => (
                    <PumpCard
                      key={pump._id}
                      pump={pump}
                      onClick={setSelectedPump}
                      isSelected={selectedPump?._id === pump._id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendations (sidebar, hidden on mobile unless tab selected) */}
            <div className={`p-2 ${activeTab === 'recs' ? 'block' : 'hidden lg:hidden'}`}>
              <RecommendationList
                recommendations={recommendations}
                loading={recsLoading}
                onSelect={setSelectedPump}
              />
            </div>

            {/* Voice Assistant */}
            <div className="p-4 border-t border-slate-800 flex flex-col items-center">
              <VoiceAssistant onCommand={handleVoiceCommand} />
            </div>
          </div>

          {/* Map area */}
          <div className={`flex-1 flex flex-col ${activeTab === 'map' ? 'block' : 'hidden lg:flex'}`}>
            <div className="flex-1 p-3" style={{ minHeight: '400px' }}>
              <Map
                location={location}
                pumps={filteredPumps}
                selectedPump={selectedPump}
                onPumpClick={setSelectedPump}
              />
            </div>

            {/* Selected pump detail panel */}
            {selectedPump && (
              <div className="border-t border-slate-800 p-4 bg-slate-900">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{selectedPump.name}</h3>
                    <p className="text-slate-400 text-sm">{selectedPump.address}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPump(null)}
                    className="text-slate-400 hover:text-white text-xl leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/pump-detail/${selectedPump._id}`}
                    className="btn-primary text-sm flex-1 text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setCrowdModalPump(selectedPump)}
                    className="btn-secondary text-sm flex-1"
                  >
                    📊 Report Crowd
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crowd Report Modal */}
      {crowdModalPump && (
        <CrowdReportModal
          pump={crowdModalPump}
          onClose={() => setCrowdModalPump(null)}
          onSuccess={() => {
            refetchPumps();
            setCrowdModalPump(null);
          }}
        />
      )}
    </>
  );
}
