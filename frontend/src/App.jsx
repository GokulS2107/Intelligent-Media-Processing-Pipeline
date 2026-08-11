import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ImageUpload from './components/ImageUpload';
import ProcessingStatus from './components/ProcessingStatus';
import Results from './components/Results';
import Dashboard from './pages/Dashboard';
import { getImageResults } from './services/api';
import './App.css';

function App() {
  const [processingId, setProcessingId] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (id) => {
    setProcessingId(id);
    setShowResults(false);
    setResults(null);
    setError(null);

    return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
  };

  const handleProcessingComplete = async (id) => {
    try {
      const response = await getImageResults(id);
      if (response.success) {
        setResults(response);
        setShowResults(true);
      } else {
        setError('Failed to retrieve results');
      }
    } catch (err) {
      setError('Error fetching results');
      console.error(err);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setShowResults(false);
    setResults(null);
    const id = processingId;
    setProcessingId(null);
    setTimeout(() => setProcessingId(id), 100);
  };

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('App Error:', error);
        // Could send to analytics or error reporting service
      }}
    >
      <div className="app">
        <header>
          <h1>Intelligent Media Processing Pipeline</h1>
          <p>Upload vehicle images for analysis</p>
        </header>

        <main>
          <div className="container">
            {!processingId && !showResults && (
              <ImageUpload onUploadSuccess={handleUploadSuccess} />
            )}

            {processingId && !showResults && (
              <ProcessingStatus 
                processingId={processingId}
                onComplete={handleProcessingComplete}
              />
            )}

            {showResults && results && (
              <Results results={results} />
            )}

            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={handleRetry} className="retry-button">
                  Retry Processing
                </button>
              </div>
            )}

            {showResults && (
              <button 
                onClick={() => {
                  setProcessingId(null);
                  setShowResults(false);
                  setResults(null);
                }}
                className="reset-button"
              >
                Upload Another Image
              </button>
            )}
          </div>
        </main>

        <footer>
          <p>AI-assisted analysis using heuristic and probabilistic methods</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;