import { globalInsights } from '../data/insights';

function TrendIcon({ trend }) {
  if (trend === 'rising')
    return <span className="text-red-400">↗ Rising</span>;
  if (trend === 'falling')
    return <span className="text-emerald-400">↘ Falling</span>;
  return <span className="text-zinc-400">→ Stable</span>;
}

function DemandBadge({ level }) {
  const styles = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`badge border ${styles[level] || styles.Medium}`}>
      {level}
    </span>
  );
}

export default function InsightsPanel({ pumpInsight = null }) {
  const insights = pumpInsight || globalInsights;
  const demand = pumpInsight?.demandLevel || globalInsights.demandLevel;
  const bestTime = pumpInsight?.bestTime || globalInsights.bestTimeToVisit;
  const trend = pumpInsight?.priceTrend || globalInsights.priceTrend;

  return (
    <div className="glass rounded-2xl overflow-hidden gradient-border">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm">
            🧠
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Insights</h3>
            <p className="text-zinc-500 text-[10px]">Powered by FuelSync ML</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Demand */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Demand Level</p>
            <div className="flex items-center gap-2">
              <DemandBadge level={demand} />
            </div>
          </div>

          {/* Best Time */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Best Time</p>
            <p className="text-white font-semibold text-sm">{bestTime}</p>
          </div>

          {/* Price Trend */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Price Trend</p>
            <p className="font-semibold text-sm">
              <TrendIcon trend={trend} />
            </p>
          </div>
        </div>

        {/* Prediction text */}
        {!pumpInsight && (
          <div className="mt-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
            <p className="text-zinc-400 text-xs leading-relaxed">
              {globalInsights.prediction}
            </p>
            <p className="text-zinc-600 text-[10px] mt-2">
              Last analyzed: {globalInsights.lastAnalyzed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
