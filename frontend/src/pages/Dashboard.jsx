import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import ImageUpload from '../components/ImageUpload';
import ProcessingStatus from '../components/ProcessingStatus';
import Results from '../components/Results';
import { getImageStatus, getImageResults, retryImage } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [processingId, setProcessingId] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentImages, setRecentImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('upload'); // 'upload', 'status', 'results'
  const [history, setHistory] = useState([]);

  // Load recent images and stats on mount
  useEffect(() => {
    loadRecentImages();
    loadStats();
  }, []);

  const loadRecentImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setRecentImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load recent images:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/images/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUploadSuccess = (id) => {
    setProcessingId(id);
    setShowResults(false);
    setResults(null);
    setError(null);
    setView('status');
    
    // Add to history
    setHistory(prev => [{ id, timestamp: new Date(), status: 'pending' }, ...prev]);
    
    // Refresh recent images and stats
    loadRecentImages();
    loadStats();
  };

  const handleProcessingComplete = async (id) => {
    try {
      setLoading(true);
      const response = await getImageResults(id);
      if (response.success) {
        setResults(response);
        setShowResults(true);
        setView('results');
        
        // Update history
        setHistory(prev => 
          prev.map(item => 
            item.id === id ? { ...item, status: 'completed' } : item
          )
        );
      } else {
        setError('Failed to retrieve results');
      }
    } catch (err) {
      setError('Error fetching results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!processingId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await retryImage(processingId);
      if (response.success) {
        setShowResults(false);
        setResults(null);
        setView('status');
        
        // Update history
        setHistory(prev => 
          prev.map(item => 
            item.id === processingId ? { ...item, status: 'pending' } : item
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retry processing');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (id) => {
    setProcessingId(id);
    setShowResults(false);
    setResults(null);
    setError(null);
    setView('status');
  };

  const handleReset = () => {
    setProcessingId(null);
    setShowResults(false);
    setResults(null);
    setError(null);
    setView('upload');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📸 Intelligent Media Processing Pipeline</h1>
          <p className="subtitle">Upload vehicle images for AI-powered analysis</p>
        </div>
        
        {stats && (
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{stats.total || 0}</span>
              <span className="stat-label">Total Images</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.stats?.completed || 0}</span>
              <span className="stat-label">Processed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.stats?.failed || 0}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.stats?.pending || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Left Column - Main Content */}
          <div className="main-content">
            <ErrorBoundary
              fallback={({ error, retry }) => (
                <div className="error-container">
                  <p>Something went wrong in the dashboard</p>
                  <p className="error-detail">{error?.message}</p>
                  <button onClick={retry} className="retry-button">
                    Retry
                  </button>
                </div>
              )}
            >
              {view === 'upload' && (
                <div className="upload-section">
                  <div className="section-header">
                    <h2>Upload Image</h2>
                    <p>Select an image to begin processing</p>
                  </div>
                  <ImageUpload onUploadSuccess={handleUploadSuccess} />
                </div>
              )}

              {view === 'status' && processingId && !showResults && (
                <div className="status-section">
                  <div className="section-header">
                    <h2>Processing Status</h2>
                    <button onClick={handleReset} className="back-button">
                      ← New Upload
                    </button>
                  </div>
                  <ProcessingStatus 
                    processingId={processingId}
                    onComplete={handleProcessingComplete}
                  />
                </div>
              )}

              {view === 'results' && showResults && results && (
                <div className="results-section">
                  <div className="section-header">
                    <h2>Analysis Results</h2>
                    <div className="header-actions">
                      <button onClick={handleReset} className="back-button">
                        ← New Upload
                      </button>
                    </div>
                  </div>
                  <Results results={results} />
                  
                  <div className="results-actions">
                    <button 
                      onClick={handleReset} 
                      className="action-button primary"
                    >
                      Upload Another Image
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-section">
                  <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                      <button onClick={handleRetry} className="retry-button">
                        Retry
                      </button>
                      <button onClick={handleReset} className="reset-button">
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Processing...</p>
                </div>
              )}
            </ErrorBoundary>
          </div>

          {/* Right Column - Sidebar */}
          <div className="sidebar">
            <div className="sidebar-section">
              <h3>Recent Uploads</h3>
              {recentImages.length > 0 ? (
                <ul className="recent-list">
                  {recentImages.map((image) => (
                    <li key={image.processingId} className="recent-item">
                      <div className="item-info">
                        <span className="item-id">
                          {image.originalFilename || image.processingId}
                        </span>
                        <span className={`item-status status-${image.status}`}>
                          {image.status}
                        </span>
                      </div>
                      <span className="item-date">
                        {formatDate(image.createdAt)}
                      </span>
                      <button 
                        onClick={() => handleViewHistory(image.processingId)}
                        className="view-button"
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No images uploaded yet</p>
              )}
            </div>

            <div className="sidebar-section">
              <h3>Processing History</h3>
              {history.length > 0 ? (
                <ul className="history-list">
                  {history.slice(0, 10).map((item) => (
                    <li key={item.id} className="history-item">
                      <span className={`history-status status-${item.status}`}>
                        ●
                      </span>
                      <span className="history-id">{item.id}</span>
                      <span className="history-time">
                        {formatDate(item.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No history yet</p>
              )}
            </div>

            <div className="sidebar-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button onClick={handleReset} className="quick-action-button">
                  📤 New Upload
                </button>
                <button onClick={loadRecentImages} className="quick-action-button">
                  🔄 Refresh
                </button>
                <button onClick={loadStats} className="quick-action-button">
                  📊 Update Stats
                </button>
              </div>
            </div>

            <div className="sidebar-section help-section">
              <h3>Help & Tips</h3>
              <ul className="help-list">
                <li>📸 Supported formats: JPEG, PNG, WEBP</li>
                <li>📏 Max file size: 10MB</li>
                <li>🔄 Processing typically takes 5-10 seconds</li>
                <li>⚠️ Results are heuristic and probabilistic</li>
                <li>🔍 OCR accuracy depends on image quality</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            Built with ❤️ using React, Node.js, and AI-powered analysis
          </p>
          <p className="disclaimer">
            ⚠️ All analysis results are heuristic and probabilistic. 
            They should be used as indicators, not definitive proof.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;