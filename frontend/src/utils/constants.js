export const CROWD_LEVELS = {
  1: { label: 'Very Low', color: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', emoji: '🟢' },
  2: { label: 'Low', color: '#4ade80', bg: 'bg-green-500/20', text: 'text-green-400', emoji: '🟢' },
  3: { label: 'Medium', color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', emoji: '🟡' },
  4: { label: 'High', color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', emoji: '🔴' },
  5: { label: 'Very High', color: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400', emoji: '🔴' },
};

export const VOICE_COMMANDS = [
  { phrase: 'find low crowd pump', action: 'low_crowd' },
  { phrase: 'nearest pump', action: 'nearest' },
  { phrase: 'best pump', action: 'best' },
  { phrase: 'show recommendations', action: 'recommendations' },
  { phrase: 'best time to visit', action: 'best_time' },
];

export const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.2090,
  city: 'New Delhi',
};

export const MAP_DEFAULTS = {
  zoom: 13,
  minZoom: 10,
  maxZoom: 18,
};
