import { useState, useEffect, useCallback } from 'react';
import { pumpsApi } from '../services/api';

const usePumps = (location, radius = 10) => {
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPumps = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await pumpsApi.getNearby(location.lat, location.lng, radius);
      setPumps(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pumps');
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    fetchPumps();
  }, [fetchPumps]);

  return { pumps, loading, error, refetch: fetchPumps };
};

export default usePumps;
