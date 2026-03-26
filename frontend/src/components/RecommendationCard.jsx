import Link from 'next/link';

export default function RecommendationCard({ pump, rank = 1, index = 0 }) {
  return (
    <Link href={`/pump/${pump.id}`}>
      <div
        className="group glass rounded-2xl p-5 card-hover relative overflow-hidden animate-fade-in cursor-pointer"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
      >
        {/* Rank badge */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-fuel-green to-fuel-lime flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-fuel-green/20">
          #{rank}
        </div>

        {/* Score */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuel-green/10 to-fuel-lime/10 flex items-center justify-center border border-fuel-green/20">
            <span className="text-fuel-green font-bold text-lg">{pump.score}</span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">AI Score</p>
            <p className="text-white font-semibold text-sm">{pump.name}</p>
          </div>
        </div>

        {/* Why recommended */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-fuel-green/5 border border-fuel-green/10">
          <p className="text-fuel-green text-xs font-medium flex items-center gap-1.5">
            <span>✨</span> {pump.reason}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Distance</p>
            <p className="text-white font-semibold text-sm">{pump.distance} km</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Wait</p>
            <p className="text-white font-semibold text-sm">{pump.waitingTime} min</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Price</p>
            <p className="text-white font-semibold text-sm">₹{pump.price}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1">
            <span className="text-sm">⭐</span>
            <span className="text-white text-sm font-medium">{pump.rating}</span>
          </div>
          <span className="text-fuel-green text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
