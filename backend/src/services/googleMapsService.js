const axios = require('axios');
const logger = require('../utils/logger');

const MAPS_BASE = 'https://maps.googleapis.com/maps/api';
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const isAvailable = () => Boolean(API_KEY);

/**
 * Get drive distance (km) and duration (minutes) from one origin to
 * multiple destinations using the Distance Matrix API.
 *
 * @param {{ lat: number, lng: number }} origin
 * @param {Array<{ lat: number, lng: number }>} destinations
 * @returns {Promise<Array<{ distanceKm: number, durationMin: number } | null>>}
 *   One entry per destination; null when the element status is not OK.
 */
const getDistanceMatrix = async (origin, destinations) => {
  if (!isAvailable()) return null;
  if (!destinations.length) return [];

  const originsParam = `${origin.lat},${origin.lng}`;
  const destinationsParam = destinations
    .map((d) => `${d.lat},${d.lng}`)
    .join('|');

  try {
    const { data } = await axios.get(`${MAPS_BASE}/distancematrix/json`, {
      params: {
        origins: originsParam,
        destinations: destinationsParam,
        mode: 'driving',
        units: 'metric',
        key: API_KEY,
      },
      timeout: 8000,
    });

    if (data.status !== 'OK') {
      logger.warn(`Distance Matrix API error: ${data.status} – ${data.error_message || ''}`);
      return null;
    }

    const row = data.rows[0];
    return row.elements.map((el) => {
      if (el.status !== 'OK') return null;
      return {
        distanceKm: parseFloat((el.distance.value / 1000).toFixed(2)),
        durationMin: Math.ceil(el.duration.value / 60),
        distanceText: el.distance.text,
        durationText: el.duration.text,
      };
    });
  } catch (err) {
    logger.error(`Distance Matrix request failed: ${err.message}`);
    return null;
  }
};

/**
 * Strip all HTML tags from a string using a repeated-replace loop so that
 * nested or malformed tags (e.g. "<scr<script>ipt>") cannot survive.
 */
const stripHtml = (str) => {
  let s = String(str);
  let prev;
  do {
    prev = s;
    s = s.replace(/<[^>]*>/g, '');
  } while (s !== prev);
  return s;
};

/**
 * Get turn-by-turn directions from origin to a single destination.
 *
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {Promise<object|null>} Parsed directions result or null on failure.
 */
const getDirections = async (origin, destination) => {
  if (!isAvailable()) return null;

  try {
    const { data } = await axios.get(`${MAPS_BASE}/directions/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: API_KEY,
      },
      timeout: 8000,
    });

    if (data.status !== 'OK') {
      logger.warn(`Directions API error: ${data.status} – ${data.error_message || ''}`);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    return {
      distanceKm: parseFloat((leg.distance.value / 1000).toFixed(2)),
      durationMin: Math.ceil(leg.duration.value / 60),
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map((s) => ({
        instruction: stripHtml(s.html_instructions),
        distanceText: s.distance.text,
        durationText: s.duration.text,
      })),
      overviewPolyline: route.overview_polyline.points,
      copyrights: route.copyrights,
    };
  } catch (err) {
    logger.error(`Directions request failed: ${err.message}`);
    return null;
  }
};

/**
 * Geocode a free-form address string to { lat, lng }.
 *
 * @param {string} address
 * @returns {Promise<{ lat: number, lng: number }|null>}
 */
const geocodeAddress = async (address) => {
  if (!isAvailable()) return null;

  try {
    const { data } = await axios.get(`${MAPS_BASE}/geocode/json`, {
      params: { address, key: API_KEY },
      timeout: 5000,
    });

    if (data.status !== 'OK' || !data.results.length) {
      logger.warn(`Geocode API error: ${data.status}`);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng, formattedAddress: data.results[0].formatted_address };
  } catch (err) {
    logger.error(`Geocode request failed: ${err.message}`);
    return null;
  }
};

module.exports = { isAvailable, getDistanceMatrix, getDirections, geocodeAddress };
