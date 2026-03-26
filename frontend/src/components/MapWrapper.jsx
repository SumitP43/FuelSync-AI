'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-fuel-green border-t-transparent animate-spin"></div>
        <p className="text-zinc-500 text-sm font-medium">Loading Map...</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <Map />;
}
