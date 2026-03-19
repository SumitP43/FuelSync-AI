import { CROWD_LEVELS } from './constants';

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatWaitTime = (minutes) => {
  if (!minutes || minutes < 1) return 'No wait';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const getCrowdInfo = (level) => {
  const l = Math.max(1, Math.min(5, Math.round(level)));
  return CROWD_LEVELS[l] || CROWD_LEVELS[3];
};

export const getCrowdFromStatus = (status) => {
  if (status === 'low') return CROWD_LEVELS[2];
  if (status === 'medium') return CROWD_LEVELS[3];
  return CROWD_LEVELS[5];
};

export const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
};

export const formatRating = (rating) =>
  rating ? Number(rating).toFixed(1) : 'N/A';

export const hourLabel = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

export const isOpenNow = (openTime, closeTime) => {
  const now = new Date();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const current = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  return current >= open && current <= close;
};
