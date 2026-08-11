import React from 'react';
import { useStatusPolling } from '../hooks/usePolling';
import { getImageStatus } from '../services/api';
import './ProcessingStatus.css';

const ProcessingStatus = ({ processingId, onComplete }) => {
  const {
    data: statusData,
    loading,
    error,
    isComplete,
    isFailed,
    status,
    stopPolling,
    startPolling,
    attempts,
    isPolling // Make sure this is destructured
  } = useStatusPolling(
    () => getImageStatus(processingId),
    ['completed'],
    ['failed'],
    {
      interval: 2000,
      timeout: 60000,
      maxAttempts: 30,
      onComplete: (reason, data) => {
        if (data && data.status === 'completed') {
          onComplete(processingId);
        } else if (data && data.status === 'failed') {
          console.error('Processing failed:', data.error);
        }
      },
      onError: (error) => {
        console.error('Status check error:', error);
        // Continue polling on error
      }
    }
  );

  const getStatusDisplay = () => {
    if (loading && !statusData) return '⏳ Initializing...';
    switch (status) {
      case 'pending':
        return '⏳ Waiting for processing...';
      case 'processing':
        return '🔄 Analyzing image...';
      case 'completed':
        return '✅ Processing complete!';
      case 'failed':
        return '❌ Processing failed';
      default:
        return status || 'Unknown status';
    }
  };

  const getProgressWidth = () => {
    switch (status) {
      case 'pending':
        return '10%';
      case 'processing':
        const progress = Math.min(30 + (attempts * 5), 90);
        return `${progress}%`;
      case 'completed':
        return '100%';
      case 'failed':
        return '100%';
      default:
        return '0%';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const getEstimatedTime = () => {
    if (status === 'processing') {
      const elapsed = attempts * 2; // Approximate seconds
      if (elapsed < 30) {
        return 'Processing...';
      } else if (elapsed < 60) {
        return 'Still processing...';
      } else {
        return 'Taking longer than expected...';
      }
    }
    return '';
  };

  const handleRetry = () => {
    stopPolling();
    setTimeout(() => {
      startPolling();
    }, 500);
  };

  // Fix: Check if isPolling is defined before using it
  const pollingStatus = isPolling !== undefined ? isPolling : false;

  return (
    <div className={`status-container ${getStatusClass()}`}>
      <h3>Processing Status</h3>
      <div className="status-id">
        <span className="label">ID:</span>
        <span className="value">{processingId}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(processingId)}
          className="copy-button"
          title="Copy ID"
        >
          📋
        </button>
      </div>
      
      <div className="status-display">
        <span className="status-icon">{getStatusDisplay()}</span>
        <span className="status-time">{getEstimatedTime()}</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className={`progress-fill ${status}`}
          style={{ width: getProgressWidth() }}
        />
      </div>
      
      {isFailed && (
        <div className="status-error">
          <p className="error-message">
            <strong>Error:</strong> {statusData?.error?.message || 'Processing failed'}
          </p>
          <div className="status-actions">
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              🔄 Retry Processing
            </button>
          </div>
        </div>
      )}
      
      {error && !isFailed && (
        <div className="status-error">
          <p className="error-message">
            <strong>Connection error:</strong> {error.message || 'Failed to check status'}
          </p>
          <button 
            onClick={() => {
              stopPolling();
              setTimeout(() => startPolling(), 1000);
            }}
            className="retry-button"
          >
            🔄 Reconnect
          </button>
        </div>
      )}
      
      <div className="status-footer">
        <span className="polling-info">
          {pollingStatus ? '🔄 Polling...' : '⏸️ Paused'}
        </span>
        <span className="attempts-info">
          Attempt {attempts || 0}
        </span>
      </div>
    </div>
  );
};

export default ProcessingStatus;