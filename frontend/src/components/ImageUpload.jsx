import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { uploadImage } from '../services/api';
import './ImageUpload.css';

const ImageUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await uploadImage(file);
      onUploadSuccess(response.processingId);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-area">
        {preview ? (
          <img src={preview} alt="Preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">
            <p>Drop image here or click to select</p>
            <p className="hint">JPEG, PNG, WEBP (max 10MB)</p>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>
      <div className="upload-actions">
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="upload-button"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

// Wrap with ErrorBoundary for component-level error handling
const ImageUploadWithErrorBoundary = (props) => (
  <ErrorBoundary
    fallback={({ error, retry }) => (
      <div className="upload-error-container">
        <p>Failed to load upload component</p>
        <p className="error-detail">{error?.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    )}
  >
    <ImageUpload {...props} />
  </ErrorBoundary>
);

export default ImageUploadWithErrorBoundary;