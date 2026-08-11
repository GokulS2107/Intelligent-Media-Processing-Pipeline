const ImageService = require('../../src/services/imageService');
const Image = require('../../src/models/Image');
const imageQueue = require('../../src/queue');

// Mock dependencies
jest.mock('../../src/models/Image');
jest.mock('../../src/queue');

describe('ImageService', () => {
  describe('uploadImage', () => {
    it('should create image record and add to queue', async () => {
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        filename: 'test_123.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };

      Image.create.mockResolvedValue({
        processingId: 'img_123',
        status: 'pending'
      });

      imageQueue.add.mockResolvedValue({ id: 'job_123' });

      const result = await ImageService.uploadImage(mockFile);

      expect(result).toHaveProperty('processingId');
      expect(result.status).toBe('pending');
      expect(Image.create).toHaveBeenCalled();
      expect(imageQueue.add).toHaveBeenCalled();
    });
  });
});