/**
 * Haversine formula for calculating distance between two coordinates
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 * @param {number} deg
 * @returns {number}
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((EARTH_RADIUS_KM * c).toFixed(2));
};

/**
 * Filter pumps within a given radius
 * @param {Array} pumps - Array of pump objects with latitude/longitude
 * @param {number} userLat
 * @param {number} userLng
 * @param {number} radiusKm
 * @returns {Array} Pumps with distance field added, sorted by distance
 */
const filterPumpsByRadius = (pumps, userLat, userLng, radiusKm) => {
  return pumps
    .map((pump) => ({
      ...pump,
      distance: haversineDistance(userLat, userLng, pump.latitude, pump.longitude),
    }))
    .filter((pump) => pump.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = { haversineDistance, filterPumpsByRadius };
