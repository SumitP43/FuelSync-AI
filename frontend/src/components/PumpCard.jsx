import { formatDistance, formatWaitTime, formatRating, getCrowdInfo } from '../utils/helpers';
import CrowdIndicator from './CrowdIndicator';

const PumpCard = ({ pump, onClick, isSelected = false, rank = null }) => {
  const crowd = getCrowdInfo(pump.current_crowd_level || pump.crowd_level || 2);
  const waitMinutes = pump.predicted_wait || pump.historical_avg_wait;

  return (
    <div
      onClick={() => onClick?.(pump)}
      className={`card-hover p-4 transition-all duration-200 ${
        isSelected ? 'border-green-500 shadow-green-500/20 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {rank && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                #{rank}
              </span>
            )}
            <h3 className="font-semibold text-white text-sm leading-tight truncate">
              {pump.name}
            </h3>
          </div>
          <p className="text-slate-400 text-xs truncate mb-2">{pump.address}</p>

          <div className="flex flex-wrap items-center gap-2">
            <CrowdIndicator level={pump.current_crowd_level || pump.crowd_level || 2} size="sm" />

            {pump.distance !== undefined && (
              <span className="text-slate-300 text-xs flex items-center gap-1">
                📍 {formatDistance(pump.distance)}
              </span>
            )}

            <span className="text-slate-300 text-xs flex items-center gap-1">
              ⏱ {formatWaitTime(waitMinutes)}
            </span>

            {pump.average_rating > 0 && (
              <span className="text-yellow-400 text-xs flex items-center gap-1">
                ⭐ {formatRating(pump.average_rating)}
              </span>
            )}
          </div>

          {pump.reason && (
            <p className="text-green-400 text-xs mt-2 italic">✨ {pump.reason}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {pump.amenities?.washroom && (
            <span className="text-slate-500 text-xs">🚻</span>
          )}
          {pump.amenities?.shop && (
            <span className="text-slate-500 text-xs">🏪</span>
          )}
          {pump.amenities?.atm && (
            <span className="text-slate-500 text-xs">🏧</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PumpCard;
