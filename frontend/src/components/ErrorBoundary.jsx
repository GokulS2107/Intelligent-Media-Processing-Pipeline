import React, { Component } from 'react';
import './ErrorBoundary.css';

/**
 * Error Boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo: errorInfo
    });

    // You could send error logs to a service like Sentry here
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  componentDidUpdate(prevProps) {
    // If the component keys change, reset the error state
    if (this.props.resetKey !== prevProps.resetKey) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    });
  };

  handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // Reset error state and let the component try again
    this.resetError();
    
    // Call optional retry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    if (process.env.NODE_ENV === 'development') {
      return {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack
      };
    }
    
    // In production, only show generic message
    return {
      message: 'Something went wrong',
      stack: undefined,
      componentStack: undefined
    };
  };

  render() {
    const { hasError, error, isRetrying } = this.state;
    const { 
      fallback, 
      children, 
      onError,
      showDetails = process.env.NODE_ENV === 'development'
    } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error, reset: this.resetError, retry: this.handleRetry })
          : fallback;
      }

      // Default fallback UI
      const errorDetails = this.getErrorDetails();

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg 
                viewBox="0 0 24 24" 
                width="64" 
                height="64" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            
            <h2 className="error-title">
              {isRetrying ? 'Retrying...' : 'Something went wrong'}
            </h2>
            
            <p className="error-message">
              {isRetrying 
                ? 'Attempting to recover...' 
                : error?.message || 'An unexpected error occurred'}
            </p>

            {showDetails && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-stack">
                  <strong>Error:</strong>
                  <pre>{errorDetails.message}</pre>
                  
                  {errorDetails.stack && (
                    <>
                      <strong>Stack Trace:</strong>
                      <pre>{errorDetails.stack}</pre>
                    </>
                  )}
                  
                  {errorDetails.componentStack && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre>{errorDetails.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button 
                onClick={this.handleRetry} 
                className="error-button retry-button"
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
              
              <button 
                onClick={this.handleReload} 
                className="error-button reload-button"
              >
                Reload Page
              </button>
            </div>

            {this.props.errorCode && (
              <div className="error-code">
                Error Code: {this.props.errorCode}
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC to wrap components with ErrorBoundary
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for using ErrorBoundary in functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = () => setError(null);
  
  const handleError = (error) => {
    setError(error);
    console.error('Caught error:', error);
  };
  
  return {
    error,
    resetError,
    handleError,
    ErrorBoundaryComponent: ({ children }) => (
      <ErrorBoundary 
        fallback={({ error, reset }) => (
          <div className="error-boundary-container">
            <div className="error-boundary-content">
              <h3>Something went wrong</h3>
              <p>{error?.message}</p>
              <button onClick={reset}>Try Again</button>
            </div>
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    )
  };
};

export default ErrorBoundary;