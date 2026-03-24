import { useState } from 'react';
import PumpCard from './PumpCard';

const RecommendationList = ({ recommendations, loading, onSelect }) => {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧠</span>
          <span className="font-semibold text-white">AI Recommendations</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-700/50 rounded-lg mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!recommendations?.length) return null;

  const best = recommendations[0];

  return (
    <div className="card p-4">
      <button
        className="w-full flex items-center justify-between mb-3"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="font-semibold text-white">AI Recommendations</span>
          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {recommendations.length}
          </span>
        </div>
        <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          {/* Best pick highlight */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span>🏆</span>
              <span className="text-green-400 font-semibold text-sm">Best Pick</span>
            </div>
            <p className="text-white font-medium text-sm">{best.name}</p>
            <p className="text-green-400 text-xs mt-1 italic">{best.reason}</p>
          </div>

          <div className="space-y-2">
            {recommendations.map((pump, i) => (
              <PumpCard
                key={pump._id}
                pump={pump}
                onClick={onSelect}
                rank={i + 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendationList;
