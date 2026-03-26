export default function EmptyState({ icon = '📭', title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="text-5xl mb-4 animate-float">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-zinc-500 text-sm text-center max-w-xs">{description}</p>
    </div>
  );
}
