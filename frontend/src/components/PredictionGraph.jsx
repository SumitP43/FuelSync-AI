import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { hourLabel } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const crowd =
    d?.crowd_status === 'low' ? '🟢 Low' :
    d?.crowd_status === 'medium' ? '🟡 Medium' : '🔴 High';

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-300 font-medium">{label}</p>
      <p className="text-green-400 font-semibold">{payload[0].value} min wait</p>
      <p className="text-slate-400">{crowd}</p>
      {d?.confidence && (
        <p className="text-slate-500 text-xs">
          Confidence: {Math.round(d.confidence * 100)}%
        </p>
      )}
    </div>
  );
};

const PredictionGraph = ({ data, loading, pumpName }) => {
  const currentHour = new Date().getHours();

  const chartData = data.map((d) => ({
    ...d,
    name: hourLabel(d.hour),
    fill: d.crowd_status === 'low' ? '#22c55e' : d.crowd_status === 'medium' ? '#eab308' : '#ef4444',
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner text="Loading predictions..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500">
        No prediction data available
      </div>
    );
  }

  return (
    <div>
      {pumpName && (
        <p className="text-slate-400 text-sm mb-3">
          24-hour wait time forecast for{' '}
          <span className="text-white font-medium">{pumpName}</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="waitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval={2}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(v) => `${v}m`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={hourLabel(currentHour)}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: 'Now', fill: '#22c55e', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="predicted_wait"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#waitGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">🟢 Low (&lt;15 min)</span>
        <span className="flex items-center gap-1">🟡 Medium (15–30 min)</span>
        <span className="flex items-center gap-1">🔴 High (&gt;30 min)</span>
      </div>
    </div>
  );
};

export default PredictionGraph;
