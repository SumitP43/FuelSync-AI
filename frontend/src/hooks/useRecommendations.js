import { useState, useEffect, useCallback } from 'react';
import { recommendationsApi } from '../services/api';

const useRecommendations = (location) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await recommendationsApi.get(location.lat, location.lng);
      setRecommendations(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
};

export default useRecommendations;
