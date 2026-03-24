import { useState } from 'react';
import { crowdReportApi } from '../services/api';
import { CROWD_LEVELS } from '../utils/constants';

const CrowdReportModal = ({ pump, onClose, onSuccess }) => {
  const [level, setLevel] = useState(3);
  const [waitTime, setWaitTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await crowdReportApi.submit({
        pump_id: pump._id,
        crowd_level: level,
        wait_time_reported: waitTime ? parseInt(waitTime) : undefined,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Report Current Crowd</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        {pump && <p className="text-slate-400 text-sm mb-4 truncate">{pump.name}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Crowd Level
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((l) => {
                const info = CROWD_LEVELS[l];
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      level === l
                        ? `${info.bg} ${info.text} ring-1 ring-current`
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-lg">{info.emoji}</div>
                    <div className="text-xs mt-0.5">{l}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-center mt-2 text-sm font-medium" style={{ color: CROWD_LEVELS[level].color }}>
              {CROWD_LEVELS[level].label}
            </p>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">
              Wait Time (optional)
            </label>
            <input
              type="number"
              value={waitTime}
              onChange={(e) => setWaitTime(e.target.value)}
              placeholder="Minutes"
              min="0"
              max="120"
              className="input-field text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm disabled:opacity-50">
              {loading ? 'Submitting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrowdReportModal;
