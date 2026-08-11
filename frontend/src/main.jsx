import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Performance monitoring (optional)
const reportWebVitals = (metric) => {
  // Log web vitals to analytics or console
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric.name, metric.value);
  }
  
  // Send to analytics service if available
  // if (window.gtag) {
  //   window.gtag('event', 'web_vitals', {
  //     event_category: 'Web Vitals',
  //     event_label: metric.name,
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     non_interaction: true,
  //   });
  // }
};

// Error handler for uncaught errors
const handleGlobalError = (event) => {
  console.error('Global error caught:', event.error || event.message);
  
  // Log to error reporting service if available
  // if (window.Sentry) {
  //   window.Sentry.captureException(event.error || new Error(event.message));
  // }
};

// Error handler for unhandled promise rejections
const handleUnhandledRejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Log to error reporting service if available
  // if (window.Sentry) {
  //   window.Sentry.captureException(event.reason);
  // }
};

// Register global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Check if environment variables are properly set
const checkEnvironment = () => {
  const requiredEnvVars = ['VITE_API_URL'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      '⚠️ Missing environment variables:',
      missingVars.join(', ')
    );
    console.warn('Some features may not work correctly.');
  }

  if (import.meta.env.VITE_API_URL) {
    console.log('🚀 API URL:', import.meta.env.VITE_API_URL);
  }
};

// Initialize application
const initApp = () => {
  // Check environment
  checkEnvironment();

  // Get root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find root element in DOM');
    return;
  }

  // Create root
  const root = ReactDOM.createRoot(rootElement);

  // Render application
  root.render(
    <React.StrictMode>
      <ErrorBoundary
        fallback={({ error, retry }) => (
          <div className="app-error-container">
            <div className="app-error-content">
              <h1>🚀 Application Error</h1>
              <p>Something went wrong while loading the application.</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="error-details">
                  <summary>Error Details</summary>
                  <pre>{error?.stack || error?.message || 'Unknown error'}</pre>
                </details>
              )}
              <div className="error-actions">
                <button onClick={retry} className="retry-button">
                  Retry
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="reload-button"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/status/:id" element={<Dashboard />} />
            <Route path="/upload" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Report web vitals
  if (process.env.NODE_ENV === 'production') {
    // Uncomment to enable web vitals reporting
    // reportWebVitals(console.log);
  }
};

// Start application
initApp();

// Hot Module Replacement (HMR) support for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 Hot module replacement: Reloading application...');
  });

  import.meta.hot.dispose(() => {
    console.log('🔄 Hot module replacement: Disposing...');
    // Cleanup if needed
  });
}

// Export for testing
export { reportWebVitals, handleGlobalError, handleUnhandledRejection };