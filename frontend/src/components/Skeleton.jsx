export default function Skeleton({ variant = 'text', count = 1 }) {
  if (variant === 'card') {
    return (
      <div className="rounded-2xl overflow-hidden glass">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 rounded-lg skeleton" />
              <div className="h-3 w-1/2 rounded-lg skeleton" />
            </div>
            <div className="h-5 w-20 rounded-full skeleton" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-full rounded skeleton" />
                <div className="h-4 w-2/3 rounded skeleton" />
              </div>
            ))}
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className="flex gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-28 rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 rounded-lg skeleton" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}
