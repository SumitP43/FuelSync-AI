import { pumps } from '../data/pumps';

export default function StatsBar() {
  const openPumps = pumps.filter((p) => p.status === 'open');
  const lowCrowd = pumps.filter((p) => p.crowdLevel === 'low').length;
  const avgWait = Math.round(
    openPumps.reduce((s, p) => s + p.waitingTime, 0) / openPumps.length
  );
  const avgPrice = (
    openPumps.reduce((s, p) => s + p.price, 0) / openPumps.length
  ).toFixed(2);

  const stats = [
    { label: 'Stations', value: pumps.length, icon: '⛽' },
    { label: 'Open Now', value: openPumps.length, icon: '🟢' },
    { label: 'Low Crowd', value: lowCrowd, icon: '😎' },
    { label: 'Avg Wait', value: `${avgWait} min`, icon: '⏱' },
    { label: 'Avg Price', value: `₹${avgPrice}`, icon: '💰' },
  ];

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-2 shrink-0 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
          >
            <span className="text-base">{s.icon}</span>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{s.value}</p>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
