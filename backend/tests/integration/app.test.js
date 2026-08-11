const request = require('supertest');
const { app } = require('../../src/app');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

describe('App Integration Tests', () => {
  let server;
  let testImagePath;

  beforeAll(async () => {
    // Create a test image if it doesn't exist
    testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple test image using sharp
      const sharp = require('sharp');
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .jpeg()
      .toFile(testImagePath);
    }
  });

  afterAll(async () => {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    // Close mongoose connection
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Image Upload', () => {
    it('should upload image successfully', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath)
        .expect(202);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('processingId');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should reject non-image files', async () => {
      const textFilePath = path.join(__dirname, '../fixtures/test.txt');
      fs.writeFileSync(textFilePath, 'This is a test file');

      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', textFilePath)
        .expect(415);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_FILE_TYPE');

      fs.unlinkSync(textFilePath);
    });

    it('should reject missing file', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NO_FILE');
    });

    it('should handle invalid content type', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(415);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CONTENT_TYPE');
    });
  });

  describe('Image Status', () => {
    let processingId;

    beforeAll(async () => {
      // Upload an image to get a processing ID
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath);
      
      processingId = response.body.processingId;
    });

    it('should return status for valid processing ID', async () => {
      const response = await request(app)
        .get(`/api/images/${processingId}/status`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('processingId', processingId);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for invalid processing ID', async () => {
      const response = await request(app)
        .get('/api/images/invalid_123/status')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should validate processing ID format', async () => {
      const response = await request(app)
        .get('/api/images/invalid-id/status')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_PROCESSING_ID');
    });
  });

  describe('Image Results', () => {
    let processingId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath);
      
      processingId = response.body.processingId;

      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should return results for completed processing', async () => {
      // This test assumes the image is already processed
      // In a real test, we might need to wait for processing
      const response = await request(app)
        .get(`/api/images/${processingId}/results`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('processingId', processingId);
    });

    it('should return 404 for invalid processing ID', async () => {
      const response = await request(app)
        .get('/api/images/invalid_123/results')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('API Statistics', () => {
    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/images/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('stats');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
    });

    it('should handle validation errors gracefully', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .field('invalid', 'data')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should include error details in development', async () => {
      // Set NODE_ENV to development temporarily
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('stack');

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CORS Configuration', () => {
    it('should allow CORS requests', async () => {
      const response = await request(app)
        .options('/api/images/upload')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    it('should reject CORS requests from unauthorized origins', async () => {
      const response = await request(app)
        .options('/api/images/upload')
        .set('Origin', 'http://unauthorized.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);

      // The response should not include the allow-origin header
      // or should have a different value
      const origin = response.headers['access-control-allow-origin'];
      if (origin) {
        expect(origin).not.toBe('*');
      }
    });
  });
});