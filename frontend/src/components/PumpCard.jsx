import Link from 'next/link';

function getCrowdBadge(level) {
  const map = {
    low: { text: 'Low Crowd', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    medium: { text: 'Moderate', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    high: { text: 'High Crowd', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  return map[level] || map.medium;
}

function getStatusDot(status) {
  return status === 'open' ? 'bg-emerald-400' : 'bg-red-400';
}

export default function PumpCard({ pump, index = 0 }) {
  const crowd = getCrowdBadge(pump.crowdLevel);

  return (
    <Link href={`/pump/${pump.id}`}>
      <div
        className="group glass rounded-2xl p-5 card-hover cursor-pointer animate-fade-in"
        style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${getStatusDot(pump.status)} shrink-0`} />
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-fuel-green transition-colors">
                {pump.name}
              </h3>
            </div>
            <p className="text-zinc-500 text-xs truncate">{pump.address}</p>
          </div>
          <div className={`badge border ${crowd.color} shrink-0`}>
            {crowd.text}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Distance</p>
            <p className="text-white font-semibold text-sm">{pump.distance} km</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Wait</p>
            <p className="text-white font-semibold text-sm">{pump.waitingTime} min</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Price</p>
            <p className="text-white font-semibold text-sm">₹{pump.price}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Rating</p>
            <p className="text-white font-semibold text-sm flex items-center gap-0.5">
              ⭐ {pump.rating}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
          <span className="text-zinc-600 text-[10px]">
            Updated {pump.lastUpdated}
          </span>
          <span className="text-fuel-green text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
