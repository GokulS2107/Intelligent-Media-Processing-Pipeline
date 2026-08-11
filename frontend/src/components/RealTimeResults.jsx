import React from 'react';
import usePolling from '../hooks/usePolling';
import { getImageResults } from '../services/api';

const RealTimeResults = ({ processingId, onResultsReady }) => {
  const {
    data,
    loading,
    error,
    isPolling,
    stopPolling,
    startPolling
  } = usePolling(
    () => getImageResults(processingId),
    {
      interval: 3000,
      onSuccess: (data) => {
        if (data.status === 'completed') {
          stopPolling();
          if (onResultsReady) {
            onResultsReady(data);
          }
        }
      },
      onError: (error) => {
        console.error('Results fetch error:', error);
      },
      shouldStop: (data) => {
        return data.status === 'completed' || data.status === 'failed';
      },
      timeout: 120000, // Stop after 2 minutes
      maxAttempts: 40
    }
  );

  if (loading && !data) {
    return <div>Loading results...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Waiting for results...</div>;
  }

  if (data.status === 'processing') {
    return (
      <div className="processing-indicator">
        <p>Processing... {isPolling ? '🔄' : '⏸️'}</p>
        <button onClick={startPolling}>Resume Polling</button>
      </div>
    );
  }

  if (data.status === 'failed') {
    return (
      <div className="error-container">
        <p>Processing failed: {data.error?.message}</p>
        <button onClick={startPolling}>Retry</button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h3>Analysis Complete</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default RealTimeResults;