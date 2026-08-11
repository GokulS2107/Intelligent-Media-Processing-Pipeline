// Additional setup after test environment is initialized

// Mock Redis for tests
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
});

// Mock BullMQ for tests
jest.mock('bullmq', () => {
  const actual = jest.requireActual('bullmq');
  return {
    ...actual,
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
      close: jest.fn().mockResolvedValue(),
      getJob: jest.fn().mockResolvedValue({ 
        data: { processingId: 'mock-id' },
        remove: jest.fn()
      })
    })),
    Worker: jest.fn().mockImplementation(() => ({
      close: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      emit: jest.fn()
    }))
  };
});

// Global afterEach to clean up
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global afterAll to clean up
afterAll(async () => {
  // Clean up any remaining resources
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  // Clean up test uploads directory
  const fs = require('fs');
  const path = require('path');
  const testUploadDir = path.join(__dirname, '../test-uploads');
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
});

// Mock Sharp for testing
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
      channels: 3,
      space: 'srgb',
      hasAlpha: false
    }),
    resize: jest.fn().mockReturnThis(),
    raw: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue({
      data: Buffer.from([100, 150, 200]),
      info: { width: 800, height: 600, channels: 3 }
    }),
    toFile: jest.fn().mockResolvedValue({}),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis()
  }));
});

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: {
      text: 'KA01AB1234',
      confidence: 87
    }
  })
}));

console.log('✅ Test environment setup complete');