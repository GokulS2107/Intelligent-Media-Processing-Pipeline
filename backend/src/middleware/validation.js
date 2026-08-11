const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Middleware to validate image file before processing
 */
const validateImageFile = (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.code = 'NO_FILE';
      error.status = 400;
      return next(error);
    }

    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
    if (req.file.size > maxSize) {
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
      error.code = 'FILE_TOO_LARGE';
      error.status = 413;
      return next(error);
    }

    // Validate MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error('Only JPEG, PNG, and WEBP images are supported');
      error.code = 'INVALID_FILE_TYPE';
      error.status = 415;
      return next(error);
    }

    // Validate file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExts.includes(ext)) {
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error('File extension must be .jpg, .jpeg, .png, or .webp');
      error.code = 'INVALID_FILE_EXTENSION';
      error.status = 415;
      return next(error);
    }

    // Continue to next middleware
    next();
  } catch (error) {
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    next(error);
  }
};

/**
 * Validate image dimensions and integrity using Sharp
 */
const validateImageIntegrity = async (req, res, next) => {
  try {
    if (!req.file || !req.file.path) {
      return next();
    }

    let metadata;
    try {
      // Try to read image metadata with Sharp
      metadata = await sharp(req.file.path).metadata();
    } catch (error) {
      // If Sharp can't read the image, it's corrupted or invalid
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const validationError = new Error('Image appears to be corrupted or invalid');
      validationError.code = 'CORRUPTED_IMAGE';
      validationError.status = 400;
      return next(validationError);
    }

    // Validate minimum dimensions
    const minWidth = 50;
    const minHeight = 50;
    if (metadata.width < minWidth || metadata.height < minHeight) {
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error(`Image dimensions too small. Minimum: ${minWidth}x${minHeight} pixels`);
      error.code = 'DIMENSIONS_TOO_SMALL';
      error.status = 400;
      return next(error);
    }

    // Validate maximum dimensions
    const maxWidth = 8000;
    const maxHeight = 8000;
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      // Clean up the file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const error = new Error(`Image dimensions too large. Maximum: ${maxWidth}x${maxHeight} pixels`);
      error.code = 'DIMENSIONS_TOO_LARGE';
      error.status = 400;
      return next(error);
    }

    // Store metadata in request for later use
    req.imageMetadata = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
      space: metadata.space,
      hasAlpha: metadata.hasAlpha
    };

    next();
  } catch (error) {
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    next(error);
  }
};

/**
 * Validate processing ID format
 */
const validateProcessingId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    const error = new Error('Processing ID is required');
    error.code = 'MISSING_PROCESSING_ID';
    error.status = 400;
    return next(error);
  }

  // Validate format: img_ followed by alphanumeric characters
  const validFormat = /^img_[a-zA-Z0-9_]+$/.test(id);
  if (!validFormat) {
    const error = new Error('Invalid processing ID format');
    error.code = 'INVALID_PROCESSING_ID';
    error.status = 400;
    return next(error);
  }

  next();
};

/**
 * Validate request body for retry endpoint
 */
const validateRetryRequestBody = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    const error = new Error('Processing ID is required');
    error.code = 'MISSING_PROCESSING_ID';
    error.status = 400;
    return next(error);
  }

  // Additional validation for retry
  // Check if there's any body content that shouldn't be there
  if (req.body && Object.keys(req.body).length > 0) {
    const error = new Error('Retry endpoint does not accept request body');
    error.code = 'INVALID_REQUEST_BODY';
    error.status = 400;
    return next(error);
  }

  next();
};

/**
 * Validate query parameters for status/results endpoints
 */
const validateQueryParams = (req, res, next) => {
  // Add any query parameter validation here
  // For example, if we add pagination or filtering later
  
  const { include, format } = req.query;
  
  // Validate include parameter if provided
  if (include) {
    const validIncludes = ['metadata', 'analysis', 'all'];
    if (!validIncludes.includes(include)) {
      const error = new Error('Invalid include parameter. Must be: metadata, analysis, or all');
      error.code = 'INVALID_QUERY_PARAM';
      error.status = 400;
      return next(error);
    }
  }
  
  // Validate format parameter if provided
  if (format) {
    const validFormats = ['json', 'xml'];
    if (!validFormats.includes(format)) {
      const error = new Error('Invalid format parameter. Must be: json or xml');
      error.code = 'INVALID_QUERY_PARAM';
      error.status = 400;
      return next(error);
    }
  }
  
  next();
};

/**
 * Validate file size before upload (multer already handles this, but we add extra check)
 */
const validateFileSize = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
  
  if (req.file && req.file.size > maxSize) {
    // Clean up the file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const error = new Error(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
    error.code = 'FILE_TOO_LARGE';
    error.status = 413;
    return next(error);
  }
  
  next();
};

/**
 * Validate content type of request
 */
const validateContentType = (req, res, next) => {
  // Only validate for upload endpoint
  if (req.path.includes('/upload')) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      const error = new Error('Request must be multipart/form-data');
      error.code = 'INVALID_CONTENT_TYPE';
      error.status = 415;
      return next(error);
    }
  }
  
  next();
};

/**
 * Validate that processing ID exists in database
 * This is a more expensive check, use only when needed
 */
const validateProcessingIdExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Image = require('../models/Image');
    
    if (!id) {
      const error = new Error('Processing ID is required');
      error.code = 'MISSING_PROCESSING_ID';
      error.status = 400;
      return next(error);
    }
    
    const image = await Image.findOne({ processingId: id });
    if (!image) {
      const error = new Error('Processing ID not found');
      error.code = 'NOT_FOUND';
      error.status = 404;
      return next(error);
    }
    
    // Attach image to request for later use
    req.image = image;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Combined validation for image upload
 */
const validateImageUpload = [
  validateContentType,
  validateImageFile,
  validateImageIntegrity,
  validateFileSize
];

/**
 * Combined validation for status endpoint
 */
const validateStatusRequest = [
  validateProcessingId
];

/**
 * Combined validation for results endpoint
 */
const validateResultsRequest = [
  validateProcessingId,
  validateQueryParams
];

/**
 * Combined validation for retry endpoint
 */
const validateRetryRequest = [
  validateProcessingId,
  validateRetryRequestBody
];

/**
 * Middleware to sanitize file names
 */
const sanitizeFilename = (req, res, next) => {
  if (req.file && req.file.originalname) {
    // Remove any path traversal attempts
    const sanitized = req.file.originalname
      .replace(/\.\./g, '')
      .replace(/[^a-zA-Z0-9.\-_\s]/g, '')
      .trim();
    
    if (sanitized !== req.file.originalname) {
      console.warn(`Filename sanitized: ${req.file.originalname} -> ${sanitized}`);
    }
    
    req.file.originalname = sanitized || 'image';
  }
  
  next();
};

/**
 * Validate image dimensions specifically
 */
const validateDimensions = (req, res, next) => {
  if (!req.file || !req.file.path) {
    return next();
  }

  // This is a wrapper around validateImageIntegrity for specific use cases
  return validateImageIntegrity(req, res, next);
};

module.exports = {
  // Individual validators
  validateImageFile,
  validateImageIntegrity,
  validateProcessingId,
  validateRetryRequestBody,
  validateQueryParams,
  validateFileSize,
  validateContentType,
  validateProcessingIdExists,
  sanitizeFilename,
  validateDimensions,
  
  // Combined validators
  validateImageUpload,
  validateStatusRequest,
  validateResultsRequest,
  validateRetryRequest
};