export default function MapPlaceholder() {
  const pins = [
    { top: '25%', left: '35%', label: 'Gurgaon' },
    { top: '20%', left: '55%', label: 'New Delhi' },
    { top: '35%', left: '70%', label: 'Noida' },
    { top: '55%', left: '25%', label: 'Gurgaon S' },
    { top: '45%', left: '60%', label: 'Faridabad' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden relative h-72 sm:h-80 lg:h-96 group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800/50 to-zinc-900">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuel-green/5 rounded-full blur-3xl" />
      </div>

      {/* Pins */}
      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute z-10 animate-fade-in group/pin"
          style={{
            top: pin.top,
            left: pin.left,
            animationDelay: `${i * 200}ms`,
            animationFillMode: 'both',
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-fuel-green rounded-full shadow-lg shadow-fuel-green/40 animate-pulse-slow" />
            <div className="absolute -inset-2 bg-fuel-green/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900/90 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md opacity-0 group-hover/pin:opacity-100 transition-opacity">
              {pin.label}
            </div>
          </div>
        </div>
      ))}

      {/* Center label */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm rounded-xl px-3 py-2">
          <span className="text-fuel-green text-sm">📍</span>
          <span className="text-zinc-300 text-xs font-medium">Delhi NCR Region</span>
        </div>
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl px-3 py-2">
          <span className="text-zinc-400 text-xs">12 stations</span>
        </div>
      </div>
    </div>
  );
}
