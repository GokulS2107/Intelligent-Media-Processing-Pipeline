// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGO_URI = 'mongodb://localhost:27017/media_pipeline_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = 6379;
process.env.UPLOAD_DIR = './test-uploads';
process.env.MAX_FILE_SIZE = 10485760;
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Increase timeout for async tests
jest.setTimeout(30000);

// Mock console.error to keep test output clean (optional)
// console.error = jest.fn();

// Create test uploads directory
const fs = require('fs');
const path = require('path');

const testUploadDir = path.join(__dirname, '../test-uploads');
if (!fs.existsSync(testUploadDir)) {
  fs.mkdirSync(testUploadDir, { recursive: true });
}

// Clean up test uploads before tests
const cleanTestUploads = () => {
  if (fs.existsSync(testUploadDir)) {
    const files = fs.readdirSync(testUploadDir);
    for (const file of files) {
      const filePath = path.join(testUploadDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete ${filePath}:`, err);
      }
    }
  }
};

// Run cleanup before each test suite
beforeAll(() => {
  cleanTestUploads();
});

// Export for use in tests
module.exports = {
  testUploadDir,
  cleanTestUploads
};