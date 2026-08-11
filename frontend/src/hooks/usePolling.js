import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for polling an API endpoint with configurable options
 */
const usePolling = (fetchFn, options = {}) => {
  const {
    interval = 2000,
    enabled = true,
    onSuccess = null,
    onError = null,
    onComplete = null,
    shouldStop = null,
    maxAttempts = Infinity,
    timeout = Infinity,
    dependencies = [],
    immediate = true,
    transformData = null,
    backoffFactor = 1,
    maxInterval = 30000,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(false);
  const currentIntervalRef = useRef(interval);

  // Reset polling state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setAttempts(0);
    currentIntervalRef.current = interval;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
    isPollingRef.current = false;
  }, [interval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
    isPollingRef.current = false;
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    if (!enabled) return;
    
    reset();
    setIsPolling(true);
    isPollingRef.current = true;
    
    // Set timeout if specified
    if (timeout !== Infinity) {
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        if (onComplete) {
          onComplete('timeout', null);
        }
      }, timeout);
    }
    
    // Initial fetch
    refetch();
  }, [enabled, reset, timeout, stopPolling, onComplete]);

  // Refetch function
  const refetch = useCallback(async () => {
    if (!isMountedRef.current || !isPollingRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn();
      
      if (!isMountedRef.current) return;
      
      setAttempts(prev => prev + 1);
      
      // Transform data if needed
      const processedData = transformData ? transformData(result) : result;
      setData(processedData);
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(processedData);
      }
      
      // Check if polling should stop
      const shouldStopPolling = shouldStop ? shouldStop(processedData) : false;
      
      if (shouldStopPolling || attempts + 1 >= maxAttempts) {
        stopPolling();
        if (onComplete) {
          onComplete('completed', processedData);
        }
        return;
      }
      
      // Schedule next poll with backoff
      if (isPollingRef.current && isMountedRef.current) {
        const nextInterval = Math.min(
          currentIntervalRef.current * backoffFactor,
          maxInterval
        );
        currentIntervalRef.current = nextInterval;
        
        timerRef.current = setTimeout(() => {
          refetch();
        }, nextInterval);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError(err);
      setLoading(false);
      
      // Call onError callback
      if (onError) {
        onError(err);
      }
      
      // Stop polling on error if specified
      if (options.stopOnError) {
        stopPolling();
        if (onComplete) {
          onComplete('error', null);
        }
      } else {
        // Continue polling with backoff
        if (isPollingRef.current && isMountedRef.current) {
          const nextInterval = Math.min(
            currentIntervalRef.current * backoffFactor,
            maxInterval
          );
          currentIntervalRef.current = nextInterval;
          
          timerRef.current = setTimeout(() => {
            refetch();
          }, nextInterval);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, attempts, maxAttempts, stopPolling, onSuccess, onError, onComplete, 
      shouldStop, transformData, backoffFactor, maxInterval, options.stopOnError]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Start polling immediately if enabled
    if (immediate && enabled) {
      startPolling();
    }
    
    return () => {
      isMountedRef.current = false;
      stopPolling();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [immediate, enabled, startPolling, stopPolling]);

  // Restart polling when dependencies change
  useEffect(() => {
    if (enabled && isPollingRef.current) {
      stopPolling();
      startPolling();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    isPolling,
    attempts,
    stopPolling,
    startPolling,
    reset,
    refetch
  };
};

/**
 * Specialized hook for polling an API endpoint with status responses
 */
export const useStatusPolling = (fetchFn, completedStatuses = ['completed'], failedStatuses = ['failed'], options = {}) => {
  const shouldStop = useCallback((data) => {
    if (!data || !data.status) return false;
    return completedStatuses.includes(data.status) || failedStatuses.includes(data.status);
  }, [completedStatuses, failedStatuses]);

  const onComplete = useCallback((reason, data) => {
    if (options.onComplete) {
      options.onComplete(reason, data);
    }
  }, [options]);

  const result = usePolling(fetchFn, {
    ...options,
    shouldStop,
    onComplete
  });

  const isComplete = result.data && completedStatuses.includes(result.data.status);
  const isFailed = result.data && failedStatuses.includes(result.data.status);
  const status = result.data?.status || 'pending';

  return {
    ...result,
    status,
    isComplete,
    isFailed,
    isPending: !isComplete && !isFailed && result.isPolling,
    isIdle: !result.isPolling && !result.data
  };
};

export default usePolling;