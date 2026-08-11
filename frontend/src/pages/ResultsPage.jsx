import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageResults, retryImage } from '../services/api';
import './ResultsPage.css';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    blur: true,
    brightness: true,
    duplicate: true,
    ocr: true,
    plate: true,
    metadata: true
  });

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getImageResults(id);
      
      if (response.success) {
        setResults(response);
      } else if (response.status === 'processing') {
        // Still processing, show loading state
        setError({ message: 'Analysis is still in progress', code: 'PROCESSING' });
      } else if (response.status === 'failed') {
        setError({ 
          message: response.error?.message || 'Processing failed', 
          code: 'FAILED',
          details: response.error
        });
      } else {
        setError({ message: 'Failed to retrieve results', code: 'UNKNOWN' });
      }
    } catch (err) {
      setError({ 
        message: err.response?.data?.error?.message || 'Error fetching results',
        code: err.response?.data?.error?.code || 'FETCH_ERROR'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const response = await retryImage(id);
      if (response.success) {
        navigate(`/status/${id}`);
      }
    } catch (err) {
      setError({ 
        message: err.response?.data?.error?.message || 'Failed to retry',
        code: 'RETRY_FAILED'
      });
    } finally {
      setRetrying(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      completed: { label: '✅ Completed', className: 'badge-success' },
      failed: { label: '❌ Failed', className: 'badge-danger' },
      processing: { label: '⏳ Processing', className: 'badge-warning' },
      pending: { label: '⏳ Pending', className: 'badge-info' }
    };
    return configs[status] || { label: status, className: 'badge-secondary' };
  };

  const getBrightnessLabel = (classification) => {
    const labels = {
      'too_dark': '🌑 Too Dark',
      'too_bright': '☀️ Too Bright',
      'acceptable': '✅ Acceptable',
      'low_light': '🌙 Low Light',
      'high_light': '☀️ High Light'
    };
    return labels[classification] || classification;
  };

  const renderOverviewTab = () => {
    if (!results) return null;
    
    const { analysis, image } = results;
    const statusConfig = getStatusBadge(results.status);

    return (
      <div className="tab-content">
        <div className="overview-grid">
          <div className="overview-card">
            <h4>📊 Status</h4>
            <div className={`status-badge ${statusConfig.className}`}>
              {statusConfig.label}
            </div>
            {results.processedAt && (
              <p className="timestamp">Processed: {formatDate(results.processedAt)}</p>
            )}
          </div>

          <div className="overview-card">
            <h4>🖼️ Image Details</h4>
            <div className="detail-row">
              <span className="label">Dimensions:</span>
              <span className="value">{image.width} × {image.height}</span>
            </div>
            <div className="detail-row">
              <span className="label">Format:</span>
              <span className="value">{image.format?.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Size:</span>
              <span className="value">{formatFileSize(image.size)}</span>
            </div>
          </div>

          <div className="overview-card">
            <h4>📈 Analysis Summary</h4>
            <div className="summary-list">
              <div className="summary-item">
                <span>Blur:</span>
                <span className={analysis.blur?.detected ? 'text-warning' : 'text-success'}>
                  {analysis.blur?.detected ? '⚠️ Detected' : '✅ Clear'}
                </span>
              </div>
              <div className="summary-item">
                <span>Brightness:</span>
                <span className={analysis.brightness?.detected ? 'text-warning' : 'text-success'}>
                  {analysis.brightness?.classification === 'acceptable' ? '✅ Normal' : '⚠️ Issue'}
                </span>
              </div>
              <div className="summary-item">
                <span>Duplicate:</span>
                <span className={analysis.duplicate?.detected ? 'text-warning' : 'text-success'}>
                  {analysis.duplicate?.detected ? '⚠️ Found' : '✅ None'}
                </span>
              </div>
              <div className="summary-item">
                <span>OCR:</span>
                <span className={analysis.ocr?.text ? 'text-success' : 'text-warning'}>
                  {analysis.ocr?.text ? '✅ Extracted' : '⚠️ Not found'}
                </span>
              </div>
              <div className="summary-item">
                <span>Plate Format:</span>
                <span className={analysis.numberPlate?.validFormat ? 'text-success' : 'text-warning'}>
                  {analysis.numberPlate?.validFormat ? '✅ Valid' : '⚠️ Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlurTab = () => {
    if (!results?.analysis?.blur) return null;
    const blur = results.analysis.blur;
    
    return (
      <div className="tab-content">
        <div className="analysis-section">
          <div className="section-header">
            <h3>🔍 Blur Detection</h3>
            <span className={`status-indicator ${blur.detected ? 'warning' : 'success'}`}>
              {blur.detected ? 'Potential Blur Detected' : 'Image is Clear'}
            </span>
          </div>
          
          <div className="analysis-details">
            <div className="detail-card">
              <div className="metric">
                <span className="metric-label">Blur Score</span>
                <span className="metric-value">{blur.score}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Threshold</span>
                <span className="metric-value">{blur.threshold}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Status</span>
                <span className={`metric-value ${blur.detected ? 'text-warning' : 'text-success'}`}>
                  {blur.detected ? '⚠️ Blurry' : '✅ Sharp'}
                </span>
              </div>
            </div>
            
            <div className="explanation">
              <h5>How it works</h5>
              <p>
                Blur detection uses Laplacian variance to measure image sharpness. 
                Higher scores indicate sharper images, while lower scores suggest 
                potential blur. The threshold is heuristic and may vary based on 
                image content.
              </p>
              <div className="score-bar">
                <div className="score-fill" style={{ 
                  width: `${Math.min((blur.score / blur.threshold) * 100, 100)}%`,
                  background: blur.detected ? '#f6ad55' : '#68d391'
                }} />
              </div>
              <div className="score-labels">
                <span>Blurry</span>
                <span>Threshold: {blur.threshold}</span>
                <span>Sharp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBrightnessTab = () => {
    if (!results?.analysis?.brightness) return null;
    const brightness = results.analysis.brightness;
    
    const getBrightnessColor = (classification) => {
      switch (classification) {
        case 'too_dark': return '#f56565';
        case 'too_bright': return '#f6ad55';
        case 'acceptable': return '#68d391';
        default: return '#a0aec0';
      }
    };

    return (
      <div className="tab-content">
        <div className="analysis-section">
          <div className="section-header">
            <h3>☀️ Brightness Analysis</h3>
            <span className={`status-indicator ${brightness.detected ? 'warning' : 'success'}`}>
              {brightness.detected ? 'Brightness Issue Detected' : 'Brightness is Acceptable'}
            </span>
          </div>
          
          <div className="analysis-details">
            <div className="detail-card">
              <div className="metric">
                <span className="metric-label">Average Brightness</span>
                <span className="metric-value">{brightness.averageBrightness}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Classification</span>
                <span className="metric-value" style={{ 
                  color: getBrightnessColor(brightness.classification)
                }}>
                  {getBrightnessLabel(brightness.classification)}
                </span>
              </div>
            </div>
            
            <div className="explanation">
              <h5>How it works</h5>
              <p>
                Brightness analysis calculates the average pixel intensity of the image.
                Images with average brightness below 30 are considered too dark, while 
                those above 230 are considered too bright. Acceptable brightness ranges 
                between 30 and 230.
              </p>
              <div className="brightness-bar">
                <div className="brightness-range">
                  <span>Too Dark</span>
                  <span>Acceptable</span>
                  <span>Too Bright</span>
                </div>
                <div className="brightness-track">
                  <div 
                    className="brightness-indicator"
                    style={{ 
                      left: `${(brightness.averageBrightness / 255) * 100}%`,
                      background: getBrightnessColor(brightness.classification)
                    }}
                  />
                </div>
                <div className="brightness-value">
                  Current: {brightness.averageBrightness}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDuplicateTab = () => {
    if (!results?.analysis?.duplicate) return null;
    const duplicate = results.analysis.duplicate;
    
    return (
      <div className="tab-content">
        <div className="analysis-section">
          <div className="section-header">
            <h3>🔄 Duplicate Detection</h3>
            <span className={`status-indicator ${duplicate.detected ? 'warning' : 'success'}`}>
              {duplicate.detected ? 'Potential Duplicate Found' : 'No Duplicates Found'}
            </span>
          </div>
          
          <div className="analysis-details">
            <div className="detail-card">
              <div className="metric">
                <span className="metric-label">Similarity Score</span>
                <span className="metric-value">{duplicate.similarity}</span>
              </div>
              {duplicate.detected && (
                <div className="metric">
                  <span className="metric-label">Similar Image ID</span>
                  <span className="metric-value" style={{ fontSize: '0.9rem' }}>
                    {duplicate.similarImageId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="explanation">
              <h5>How it works</h5>
              <p>
                Duplicate detection uses perceptual hashing to compare images. 
                A similarity score above 0.9 indicates a potential duplicate. 
                This method is heuristic and may produce false positives or negatives.
              </p>
              <div className="similarity-bar">
                <div className="similarity-track">
                  <div 
                    className="similarity-fill"
                    style={{ 
                      width: `${duplicate.similarity * 100}%`,
                      background: duplicate.similarity > 0.9 ? '#f6ad55' : '#68d391'
                    }}
                  />
                </div>
                <div className="similarity-labels">
                  <span>Different</span>
                  <span>Similar</span>
                  <span>Duplicate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOCRTab = () => {
    if (!results?.analysis?.ocr) return null;
    const ocr = results.analysis.ocr;
    const plate = results.analysis.numberPlate;
    
    return (
      <div className="tab-content">
        <div className="analysis-section">
          <div className="section-header">
            <h3>📝 OCR & Plate Validation</h3>
            <span className={`status-indicator ${ocr.text ? 'success' : 'warning'}`}>
              {ocr.text ? 'Text Extracted' : 'No Text Detected'}
            </span>
          </div>
          
          <div className="analysis-details">
            <div className="detail-card">
              <div className="metric">
                <span className="metric-label">Extracted Text</span>
                <span className="metric-value ocr-text">{ocr.text || 'None'}</span>
              </div>
              <div className="metric">
                <span className="metric-label">OCR Confidence</span>
                <span className="metric-value">
                  {Math.round(ocr.confidence * 100)}%
                </span>
              </div>
            </div>

            {plate && (
              <div className="detail-card plate-validation">
                <h5>🚗 Vehicle Number Validation</h5>
                <div className="plate-details">
                  <div className="detail-row">
                    <span className="label">Normalized Text:</span>
                    <span className="value plate-text">{plate.normalizedText || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Format Valid:</span>
                    <span className={`value ${plate.validFormat ? 'text-success' : 'text-danger'}`}>
                      {plate.validFormat ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Confidence:</span>
                    <span className="value">{Math.round(plate.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div className="explanation">
                  <h6>⚠️ Important Note</h6>
                  <p>
                    This validation checks if the extracted text matches Indian vehicle 
                    registration format patterns. It does NOT verify that the registration 
                    number is real or valid with any government database.
                  </p>
                  <div className="format-examples">
                    <strong>Valid formats:</strong>
                    <span>KA01AB1234</span>
                    <span>MH12DE1234</span>
                    <span>DL01AB1234</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMetadataTab = () => {
    if (!results?.image) return null;
    const { image } = results;
    
    return (
      <div className="tab-content">
        <div className="analysis-section">
          <h3>🖼️ Image Metadata</h3>
          
          <div className="metadata-grid">
            <div className="metadata-card">
              <div className="metadata-item">
                <span className="label">Processing ID</span>
                <span className="value">{results.processingId}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Status</span>
                <span className={`value status-${results.status}`}>{results.status}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Processed At</span>
                <span className="value">{formatDate(results.processedAt)}</span>
              </div>
            </div>
            
            <div className="metadata-card">
              <div className="metadata-item">
                <span className="label">Dimensions</span>
                <span className="value">{image.width} × {image.height}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Format</span>
                <span className="value">{image.format?.toUpperCase()}</span>
              </div>
              <div className="metadata-item">
                <span className="label">File Size</span>
                <span className="value">{formatFileSize(image.size)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    if (error.code === 'PROCESSING') {
      return (
        <div className="error-container processing">
          <div className="error-icon">⏳</div>
          <h3>Still Processing</h3>
          <p>{error.message}</p>
          <button onClick={() => navigate(`/status/${id}`)} className="action-button">
            Check Status
          </button>
        </div>
      );
    }

    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Error</h3>
        <p>{error.message}</p>
        {error.details && (
          <div className="error-details">
            <pre>{JSON.stringify(error.details, null, 2)}</pre>
          </div>
        )}
        <div className="error-actions">
          <button onClick={handleRetry} disabled={retrying} className="action-button primary">
            {retrying ? 'Retrying...' : '🔄 Retry Processing'}
          </button>
          <button onClick={() => navigate('/')} className="action-button secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Loading Results</h3>
          <p>Fetching analysis data...</p>
        </div>
      </div>
    );
  }

  if (error && error.code !== 'PROCESSING') {
    return (
      <div className="results-page">
        <div className="page-header">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Results</h1>
        </div>
        {renderError()}
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-page">
        <div className="page-header">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Results</h1>
        </div>
        <div className="error-container">
          <h3>No Results Found</h3>
          <p>Could not retrieve results for ID: {id}</p>
          <button onClick={() => navigate('/')} className="action-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', component: renderOverviewTab },
    { id: 'blur', label: '🔍 Blur', component: renderBlurTab },
    { id: 'brightness', label: '☀️ Brightness', component: renderBrightnessTab },
    { id: 'duplicate', label: '🔄 Duplicate', component: renderDuplicateTab },
    { id: 'ocr', label: '📝 OCR & Plate', component: renderOCRTab },
    { id: 'metadata', label: '📋 Metadata', component: renderMetadataTab }
  ];

  return (
    <div className="results-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Analysis Results</h1>
        </div>
        <div className="header-right">
          <span className={`page-status ${results.status}`}>
            {getStatusBadge(results.status).label}
          </span>
          {results.status === 'failed' && (
            <button onClick={handleRetry} disabled={retrying} className="retry-button">
              {retrying ? 'Retrying...' : '🔄 Retry'}
            </button>
          )}
        </div>
      </div>

      <div className="results-content">
        <div className="tabs-container">
          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tabs-body">
            {tabs.find(tab => tab.id === activeTab)?.component()}
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <p>
          ⚠️ All analysis results are heuristic and probabilistic. 
          They should be used as indicators, not definitive proof.
          Results may vary based on image quality and content.
        </p>
      </div>
    </div>
  );
};

export default ResultsPage;