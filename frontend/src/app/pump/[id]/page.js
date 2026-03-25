'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import InsightsPanel from '../../../components/InsightsPanel';
import CrowdReport from '../../../components/CrowdReport';
import { getPumpById } from '../../../data/pumps';
import { pumpInsights } from '../../../data/insights';

function getCrowdColor(level) {
  const map = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  };
  return map[level] || 'text-zinc-400';
}

export default function PumpDetailPage() {
  const params = useParams();
  const pump = getPumpById(params.id);
  const insight = pumpInsights[params.id] || null;
  const [reportedWait, setReportedWait] = useState(null);

  if (!pump) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-white font-bold text-xl mb-2">Station Not Found</h2>
            <p className="text-zinc-500 text-sm mb-6">The station you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="btn-primary">
              ← Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentWait = reportedWait !== null ? reportedWait : pump.waitingTime;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 animate-fade-in">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">{pump.name}</span>
        </div>

        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    pump.status === 'open' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-white">{pump.name}</h1>
              </div>
              <p className="text-zinc-400 text-sm">{pump.address}</p>
              <p className="text-zinc-500 text-xs mt-1">Updated {pump.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`badge border ${
                  pump.status === 'open'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {pump.status === 'open' ? '● Open' : '● Closed'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Distance</p>
              <p className="text-white font-bold text-xl">{pump.distance}</p>
              <p className="text-zinc-500 text-xs">km away</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Waiting Time</p>
              <p className={`font-bold text-xl ${getCrowdColor(pump.crowdLevel)}`}>
                {currentWait}
              </p>
              <p className="text-zinc-500 text-xs">
                {reportedWait !== null ? 'min (reported)' : 'minutes'}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Price</p>
              <p className="text-white font-bold text-xl">₹{pump.price}</p>
              <p className="text-zinc-500 text-xs">per kg</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Rating</p>
              <p className="text-white font-bold text-xl">⭐ {pump.rating}</p>
              <p className="text-zinc-500 text-xs">/ 5.0</p>
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Details */}
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              📋 Station Details
            </h3>
            <div className="space-y-3">
              {[
                { label: 'City', value: pump.city },
                { label: 'Total Pumps', value: pump.totalPumps },
                { label: 'Operating Hours', value: pump.operatingHours },
                {
                  label: 'Crowd Level',
                  value: (
                    <span className={getCrowdColor(pump.crowdLevel)}>
                      {pump.crowdLevel.charAt(0).toUpperCase() + pump.crowdLevel.slice(1)}
                    </span>
                  ),
                },
                {
                  label: 'Coordinates',
                  value: `${pump.lat.toFixed(4)}, ${pump.lng.toFixed(4)}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
                >
                  <span className="text-zinc-500 text-xs">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <InsightsPanel pumpInsight={insight} />
          </div>
        </div>

        {/* Crowd Report */}
        <div className="max-w-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CrowdReport
            pump={pump}
            onReport={({ waitTime }) => setReportedWait(waitTime)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
