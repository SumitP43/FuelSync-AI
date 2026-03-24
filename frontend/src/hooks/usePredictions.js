import { useState, useEffect } from 'react';
import { predictionsApi } from '../services/api';

const usePredictions = (pumpId) => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pumpId) return;
    setLoading(true);
    setError(null);

    predictionsApi
      .getGraph(pumpId)
      .then(({ data }) => setGraphData(data.graph_data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load predictions'))
      .finally(() => setLoading(false));
  }, [pumpId]);

  return { graphData, loading, error };
};

export default usePredictions;
