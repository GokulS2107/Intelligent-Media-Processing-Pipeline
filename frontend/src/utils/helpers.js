import {
  STATUS,
  STATUS_DISPLAY,
  BRIGHTNESS,
  BRIGHTNESS_DISPLAY,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
  DATE_FORMATS,
  UPLOAD,
  VALIDATION,
  ANALYSIS,
} from './constants';

/**
 * Get status display configuration
 */
export const getStatusDisplay = (status) => {
  return STATUS_DISPLAY[status] || STATUS_DISPLAY[STATUS.PENDING];
};

/**
 * Get brightness display configuration
 */
export const getBrightnessDisplay = (classification) => {
  return BRIGHTNESS_DISPLAY[classification] || BRIGHTNESS_DISPLAY[BRIGHTNESS.UNKNOWN];
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date
 */
export const formatDate = (dateString, format = DATE_FORMATS.FULL) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  switch (format) {
    case DATE_FORMATS.FULL:
      return date.toLocaleString();
    case DATE_FORMATS.DATE:
      return date.toLocaleDateString();
    case DATE_FORMATS.TIME:
      return date.toLocaleTimeString();
    case DATE_FORMATS.SHORT_DATE:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    case DATE_FORMATS.SHORT_TIME:
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case DATE_FORMATS.RELATIVE:
      return getRelativeTime(date);
    default:
      return date.toLocaleString();
  }
};

/**
 * Get relative time (e.g., "5 minutes ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

/**
 * Get error message from error object
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Check for API error response
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  // Check for error code mapping
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Check for generic error message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Get error code from error object
 */
export const getErrorCode = (error) => {
  if (error.response?.data?.error?.code) {
    return error.response.data.error.code;
  }
  if (error.code) {
    return error.code;
  }
  return ERROR_CODES.INTERNAL_ERROR;
};

/**
 * Check if file is valid for upload
 */
export const isValidImageFile = (file) => {
  if (!file) return false;
  
  // Check MIME type
  if (!UPLOAD.ACCEPTED_FORMATS.includes(file.type)) {
    return false;
  }
  
  // Check file size
  if (file.size > UPLOAD.MAX_FILE_SIZE) {
    return false;
  }
  
  // Check extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!UPLOAD.ACCEPTED_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  return true;
};

/**
 * Get file validation error
 */
export const getFileValidationError = (file) => {
  if (!file) {
    return { code: ERROR_CODES.NO_FILE, message: ERROR_MESSAGES[ERROR_CODES.NO_FILE] };
  }
  
  if (!UPLOAD.ACCEPTED_FORMATS.includes(file.type)) {
    return { 
      code: ERROR_CODES.INVALID_FILE_TYPE, 
      message: ERROR_MESSAGES[ERROR_CODES.INVALID_FILE_TYPE] 
    };
  }
  
  if (file.size > UPLOAD.MAX_FILE_SIZE) {
    return { 
      code: ERROR_CODES.FILE_TOO_LARGE, 
      message: ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE] 
    };
  }
  
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!UPLOAD.ACCEPTED_EXTENSIONS.includes(ext)) {
    return { 
      code: ERROR_CODES.INVALID_FILE_EXTENSION, 
      message: ERROR_MESSAGES[ERROR_CODES.INVALID_FILE_EXTENSION] 
    };
  }
  
  return null;
};

/**
 * Check if processing ID is valid
 */
export const isValidProcessingId = (id) => {
  if (!id) return false;
  return VALIDATION.PROCESSING_ID_PATTERN.test(id);
};

/**
 * Get status class for CSS
 */
export const getStatusClass = (status) => {
  return `status-${status}`;
};

/**
 * Get brightness class for CSS
 */
export const getBrightnessClass = (classification) => {
  return `brightness-${classification}`;
};

/**
 * Check if status is terminal (completed or failed)
 */
export const isTerminalStatus = (status) => {
  return status === STATUS.COMPLETED || status === STATUS.FAILED;
};

/**
 * Check if status is processing
 */
export const isProcessingStatus = (status) => {
  return status === STATUS.PENDING || status === STATUS.PROCESSING;
};

/**
 * Get progress percentage based on status
 */
export const getStatusProgress = (status, attempts = 0) => {
  switch (status) {
    case STATUS.PENDING:
      return 10;
    case STATUS.PROCESSING:
      return Math.min(30 + (attempts * 5), 90);
    case STATUS.COMPLETED:
      return 100;
    case STATUS.FAILED:
      return 100;
    default:
      return 0;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = (json, fallback = null) => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Convert bytes to human readable format
 */
export const bytesToHuman = (bytes) => {
  return formatFileSize(bytes);
};

/**
 * Get image format display name
 */
export const getImageFormatDisplay = (format) => {
  const formats = {
    jpeg: 'JPEG',
    jpg: 'JPEG',
    png: 'PNG',
    webp: 'WEBP',
  };
  return formats[format?.toLowerCase()] || format?.toUpperCase() || 'Unknown';
};

/**
 * Get vehicle number validation result
 */
export const getPlateValidationResult = (validFormat, confidence) => {
  if (!validFormat) {
    return {
      status: 'invalid',
      message: 'Invalid plate format',
      icon: '❌',
    };
  }
  if (confidence > ANALYSIS.OCR.HIGH_CONFIDENCE) {
    return {
      status: 'valid',
      message: 'Valid plate format (high confidence)',
      icon: '✅',
    };
  }
  if (confidence > ANALYSIS.OCR.MIN_CONFIDENCE) {
    return {
      status: 'valid',
      message: 'Valid plate format (medium confidence)',
      icon: '⚠️',
    };
  }
  return {
    status: 'valid',
    message: 'Valid plate format (low confidence)',
    icon: '⚠️',
  };
};

/**
 * Export all helpers
 */
export default {
  getStatusDisplay,
  getBrightnessDisplay,
  formatFileSize,
  formatDate,
  getRelativeTime,
  getErrorMessage,
  getErrorCode,
  isValidImageFile,
  getFileValidationError,
  isValidProcessingId,
  getStatusClass,
  getBrightnessClass,
  isTerminalStatus,
  isProcessingStatus,
  getStatusProgress,
  truncateText,
  generateId,
  debounce,
  throttle,
  safeJsonParse,
  capitalize,
  isEmpty,
  bytesToHuman,
  getImageFormatDisplay,
  getPlateValidationResult,
};