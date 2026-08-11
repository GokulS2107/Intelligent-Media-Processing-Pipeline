import React from 'react';
import './Results.css';

const Results = ({ results }) => {
  if (!results) return null;

  const { analysis, image } = results;

  const renderBlur = () => {
    const { blur } = analysis;
    if (!blur || blur.score === undefined) return null;
    return (
      <div className={`result-item ${blur.detected ? 'warning' : 'success'}`}>
        <h4>Blur Detection</h4>
        <p>Status: {blur.detected ? '⚠️ Potential blur detected' : '✅ Image is clear'}</p>
        <p>Score: {blur.score} (Threshold: {blur.threshold})</p>
        <p className="note">Note: This is a heuristic measurement</p>
      </div>
    );
  };

  const renderBrightness = () => {
    const { brightness } = analysis;
    if (!brightness) return null;
    const classifications = {
      'too_dark': '🌑 Too Dark',
      'too_bright': '☀️ Too Bright',
      'acceptable': '✅ Acceptable'
    };
    return (
      <div className={`result-item ${brightness.detected ? 'warning' : 'success'}`}>
        <h4>Brightness Analysis</h4>
        <p>Status: {classifications[brightness.classification]}</p>
        <p>Average Brightness: {brightness.averageBrightness}</p>
        <p className="note">Note: This is a heuristic measurement</p>
      </div>
    );
  };

  const renderDuplicate = () => {
    const { duplicate } = analysis;
    if (!duplicate) return null;
    return (
      <div className={`result-item ${duplicate.detected ? 'warning' : 'success'}`}>
        <h4>Duplicate Detection</h4>
        <p>Status: {duplicate.detected ? '⚠️ Similar image found' : '✅ No duplicates found'}</p>
        {duplicate.detected && (
          <p>Similar Image ID: {duplicate.similarImageId}</p>
        )}
        <p>Similarity Score: {duplicate.similarity}</p>
        <p className="note">Note: Perceptual hashing may have false positives</p>
      </div>
    );
  };

  const renderOCR = () => {
    const { ocr, numberPlate } = analysis;
    if (!ocr) return null;
    return (
      <div className="result-item">
        <h4>OCR Results</h4>
        <p>Extracted Text: {ocr.text || 'None detected'}</p>
        <p>Confidence: {ocr.confidence * 100}%</p>
        {numberPlate && (
          <>
            <h5>Vehicle Number Validation</h5>
            <p>Normalized: {numberPlate.normalizedText || 'None'}</p>
            <p>Valid Format: {numberPlate.validFormat ? '✅ Yes' : '❌ No'}</p>
            <p className="note">Note: Format validation only, not government verification</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="results-container">
      <h2>Analysis Results</h2>
      
      <div className="image-metadata">
        <h3>Image Metadata</h3>
        <p>Dimensions: {image.width} x {image.height}</p>
        <p>Format: {image.format}</p>
        <p>Size: {(image.size / 1024).toFixed(1)} KB</p>
      </div>

      <div className="analysis-grid">
        {renderBlur()}
        {renderBrightness()}
        {renderDuplicate()}
        {renderOCR()}
      </div>

      <div className="disclaimer">
        <p>
          ⚠️ All analysis results are heuristic and probabilistic. 
          They should be used as indicators, not definitive proof.
        </p>
      </div>
    </div>
  );
};

export default Results;