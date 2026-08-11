module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // File extensions to consider
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Transform files with babel (optional, for modern JS)
  transform: {},
  
  // Ignore certain directories
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Setup files to run before tests
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // Setup files to run after test environment is set up
  setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.js'],
  
  // Code coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/config/**/*.js',
    '!src/models/**/*.js',
    '!src/workers/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Coverage report formats
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Timeout for tests (milliseconds)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete (for async operations)
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers (use 1 for CI, or auto for local)
  maxWorkers: '50%',
  
  // Global variables
  globals: {
    __DEV__: true
  },
  
  // Module name mapper for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};