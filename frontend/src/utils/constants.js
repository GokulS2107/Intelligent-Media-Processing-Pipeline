/**
 * Application Constants
 * Centralized configuration for the entire frontend application
 */

// API Configuration
export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/images/upload',
  STATUS: (id) => `/images/${id}/status`,
  RESULTS: (id) => `/images/${id}/results`,
  RETRY: (id) => `/images/${id}/retry`,
  IMAGES: '/images',
  STATS: '/images/stats',
  HEALTH: '/health',
};

// Image Upload Configuration
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  MIN_DIMENSIONS: { width: 50, height: 50 },
  MAX_DIMENSIONS: { width: 8000, height: 8000 },
};

// Processing Status
export const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Status Display Configuration
export const STATUS_DISPLAY = {
  [STATUS.PENDING]: {
    label: 'Pending',
    icon: '⏳',
    className: 'status-pending',
    description: 'Waiting for processing to start',
  },
  [STATUS.PROCESSING]: {
    label: 'Processing',
    icon: '🔄',
    className: 'status-processing',
    description: 'Analyzing image...',
  },
  [STATUS.COMPLETED]: {
    label: 'Completed',
    icon: '✅',
    className: 'status-completed',
    description: 'Analysis complete',
  },
  [STATUS.FAILED]: {
    label: 'Failed',
    icon: '❌',
    className: 'status-failed',
    description: 'Processing failed',
  },
};

// Polling Configuration
export const POLLING = {
  DEFAULT_INTERVAL: 2000,
  MAX_INTERVAL: 30000,
  BACKOFF_FACTOR: 1.5,
  MAX_ATTEMPTS: 30,
  TIMEOUT: 60000,
  STATUS_INTERVAL: 2000,
  RESULTS_INTERVAL: 3000,
};

// Error Codes
export const ERROR_CODES = {
  // Client Errors
  NO_FILE: 'NO_FILE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CORRUPTED_IMAGE: 'CORRUPTED_IMAGE',
  DIMENSIONS_TOO_SMALL: 'DIMENSIONS_TOO_SMALL',
  DIMENSIONS_TOO_LARGE: 'DIMENSIONS_TOO_LARGE',
  MISSING_PROCESSING_ID: 'MISSING_PROCESSING_ID',
  INVALID_PROCESSING_ID: 'INVALID_PROCESSING_ID',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',
  INVALID_QUERY_PARAM: 'INVALID_QUERY_PARAM',

  // Server Errors
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
};

// Error Messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NO_FILE]: 'Please select an image to upload',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Only JPEG, PNG, and WEBP images are supported',
  [ERROR_CODES.INVALID_FILE_EXTENSION]: 'File must have .jpg, .jpeg, .png, or .webp extension',
  [ERROR_CODES.FILE_TOO_LARGE]: `File size exceeds limit of ${UPLOAD.MAX_FILE_SIZE_MB}MB`,
  [ERROR_CODES.CORRUPTED_IMAGE]: 'Image appears to be corrupted or invalid',
  [ERROR_CODES.DIMENSIONS_TOO_SMALL]: `Image dimensions too small (minimum ${UPLOAD.MIN_DIMENSIONS.width}x${UPLOAD.MIN_DIMENSIONS.height} pixels)`,
  [ERROR_CODES.DIMENSIONS_TOO_LARGE]: `Image dimensions too large (maximum ${UPLOAD.MAX_DIMENSIONS.width}x${UPLOAD.MAX_DIMENSIONS.height} pixels)`,
  [ERROR_CODES.MISSING_PROCESSING_ID]: 'Processing ID is required',
  [ERROR_CODES.INVALID_PROCESSING_ID]: 'Invalid processing ID format',
  [ERROR_CODES.INVALID_CONTENT_TYPE]: 'Request must be multipart/form-data',
  [ERROR_CODES.INVALID_REQUEST_BODY]: 'Invalid request body',
  [ERROR_CODES.INVALID_QUERY_PARAM]: 'Invalid query parameter',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.DUPLICATE_ERROR]: 'Resource already exists',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.IMAGE_PROCESSING_FAILED]: 'Image processing failed',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again',
  [ERROR_CODES.CONNECTION_REFUSED]: 'Could not connect to server',
};

// Brightness Classifications
export const BRIGHTNESS = {
  TOO_DARK: 'too_dark',
  TOO_BRIGHT: 'too_bright',
  ACCEPTABLE: 'acceptable',
  UNKNOWN: 'unknown',
};

export const BRIGHTNESS_DISPLAY = {
  [BRIGHTNESS.TOO_DARK]: {
    label: 'Too Dark',
    icon: '🌑',
    className: 'brightness-dark',
    description: 'Image is too dark for optimal analysis',
  },
  [BRIGHTNESS.TOO_BRIGHT]: {
    label: 'Too Bright',
    icon: '☀️',
    className: 'brightness-bright',
    description: 'Image is too bright for optimal analysis',
  },
  [BRIGHTNESS.ACCEPTABLE]: {
    label: 'Acceptable',
    icon: '✅',
    className: 'brightness-acceptable',
    description: 'Image brightness is acceptable',
  },
  [BRIGHTNESS.UNKNOWN]: {
    label: 'Unknown',
    icon: '❓',
    className: 'brightness-unknown',
    description: 'Could not determine brightness',
  },
};

// Analysis Result Display
export const ANALYSIS = {
  BLUR: {
    THRESHOLD: 100,
    HIGH_SCORE: 150,
    LOW_SCORE: 50,
  },
  DUPLICATE: {
    SIMILARITY_THRESHOLD: 0.9,
    HIGH_SIMILARITY: 0.95,
    LOW_SIMILARITY: 0.7,
  },
  OCR: {
    MIN_CONFIDENCE: 0.5,
    HIGH_CONFIDENCE: 0.8,
  },
  PLATE: {
    PATTERNS: [
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, // Standard: KA01AB1234
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{3,4}$/, // With possible 3-4 digits
      /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, // Variations
    ],
  },
};

// UI Configuration
export const UI = {
  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1400,
  },
  // Animation Durations
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    TRANSITION: '0.3s ease',
  },
  // Debounce/Throttle
  DEBOUNCE: {
    INPUT: 300,
    SCROLL: 100,
    RESIZE: 250,
  },
};

// Form Validation
export const VALIDATION = {
  PROCESSING_ID_PATTERN: /^img_[a-zA-Z0-9_]+$/,
  MAX_FILENAME_LENGTH: 255,
  ALLOWED_CHARACTERS: /^[a-zA-Z0-9.\-_\s]+$/,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'media-pipeline-theme',
  LANGUAGE: 'media-pipeline-language',
  USER_PREFERENCES: 'media-pipeline-user-preferences',
  RECENT_UPLOADS: 'media-pipeline-recent-uploads',
  SESSION_ID: 'media-pipeline-session-id',
};

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Language Configuration
export const LANGUAGES = {
  EN: 'en',
  // Add more languages as needed
};

// Routes
export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  STATUS: (id) => `/status/${id}`,
  RESULTS: (id) => `/results/${id}`,
  HISTORY: '/history',
  SETTINGS: '/settings',
};

// Default Values
export const DEFAULTS = {
  STATUS: STATUS.PENDING,
  PAGE: 1,
  PAGE_SIZE: 20,
  SORT_ORDER: 'desc',
  LANGUAGE: LANGUAGES.EN,
  THEME: THEMES.SYSTEM,
};

// Feature Flags
export const FEATURES = {
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: false,
  ENABLE_HISTORY: true,
  ENABLE_STATS: true,
  ENABLE_RETRY: true,
  ENABLE_REALTIME_UPDATES: true,
  ENABLE_EXPORT_RESULTS: false,
  ENABLE_BULK_UPLOAD: false,
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  PROCESSING_ID: /^img_[a-zA-Z0-9_]+$/,
  VEHICLE_NUMBER: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
};

// Date/Time Formats
export const DATE_FORMATS = {
  FULL: 'MM/DD/YYYY HH:mm:ss',
  DATE: 'MM/DD/YYYY',
  TIME: 'HH:mm:ss',
  SHORT_DATE: 'MM/DD/YY',
  SHORT_TIME: 'HH:mm',
  RELATIVE: 'relative',
};

// Image Formats Display
export const IMAGE_FORMATS = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
};

export const IMAGE_FORMATS_DISPLAY = {
  [IMAGE_FORMATS.JPEG]: {
    label: 'JPEG',
    extension: '.jpg',
    mimeType: 'image/jpeg',
  },
  [IMAGE_FORMATS.PNG]: {
    label: 'PNG',
    extension: '.png',
    mimeType: 'image/png',
  },
  [IMAGE_FORMATS.WEBP]: {
    label: 'WEBP',
    extension: '.webp',
    mimeType: 'image/webp',
  },
};

// Analyzer Display Names
export const ANALYZER_DISPLAY = {
  BLUR: {
    label: 'Blur Detection',
    icon: '🔍',
    description: 'Detects image blur using Laplacian variance',
  },
  BRIGHTNESS: {
    label: 'Brightness Analysis',
    icon: '☀️',
    description: 'Analyzes image brightness levels',
  },
  DUPLICATE: {
    label: 'Duplicate Detection',
    icon: '🔄',
    description: 'Finds similar images using perceptual hashing',
  },
  OCR: {
    label: 'OCR',
    icon: '📝',
    description: 'Extracts text from images',
  },
  PLATE: {
    label: 'Vehicle Number Validation',
    icon: '🚗',
    description: 'Validates Indian vehicle registration format',
  },
};

// Help & Tips
export const HELP_TIPS = [
  'Supported formats: JPEG, PNG, WEBP',
  'Maximum file size: 10MB',
  'Image processing typically takes 5-10 seconds',
  'OCR accuracy depends on image quality',
  'Brightness thresholds are heuristic',
  'Results should be used as indicators, not definitive proof',
  'Retry failed jobs from the results page',
  'Check status using the processing ID',
  'Upload clear, well-lit images for best results',
  'Vehicle number validation is format-only',
];

// Navigation Items
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: '📊',
    route: ROUTES.HOME,
    exact: true,
  },
  {
    label: 'Upload',
    icon: '📤',
    route: ROUTES.UPLOAD,
    exact: true,
  },
  {
    label: 'History',
    icon: '📋',
    route: ROUTES.HISTORY,
    exact: true,
  },
  {
    label: 'Settings',
    icon: '⚙️',
    route: ROUTES.SETTINGS,
    exact: true,
  },
];

// Export all constants as a single object for convenience
export const CONSTANTS = {
  API,
  API_ENDPOINTS,
  UPLOAD,
  STATUS,
  STATUS_DISPLAY,
  POLLING,
  ERROR_CODES,
  ERROR_MESSAGES,
  BRIGHTNESS,
  BRIGHTNESS_DISPLAY,
  ANALYSIS,
  UI,
  VALIDATION,
  HTTP_STATUS,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  ROUTES,
  DEFAULTS,
  FEATURES,
  REGEX,
  DATE_FORMATS,
  IMAGE_FORMATS,
  IMAGE_FORMATS_DISPLAY,
  ANALYZER_DISPLAY,
  HELP_TIPS,
  NAV_ITEMS,
};

export default CONSTANTS;