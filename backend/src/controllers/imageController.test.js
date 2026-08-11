const ImageController = require('./imageController');
const ImageService = require('../services/imageService');

// Mock the ImageService
jest.mock('../services/imageService');

describe('ImageController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should successfully upload an image', async () => {
      // Arrange
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        filename: 'test_123.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      req.file = mockFile;

      const mockResult = {
        processingId: 'img_123456',
        status: 'pending',
        message: 'Image uploaded successfully'
      };

      ImageService.uploadImage.mockResolvedValue(mockResult);

      // Act
      await ImageController.upload(req, res, next);

      // Assert
      expect(ImageService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing file', async () => {
      // Arrange
      req.file = null;

      // Act
      await ImageController.upload(req, res, next);

      // Assert
      expect(ImageService.uploadImage).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('No file uploaded');
      expect(error.code).toBe('NO_FILE');
    });

    it('should handle upload errors', async () => {
      // Arrange
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        filename: 'test_123.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      req.file = mockFile;

      const mockError = new Error('Invalid file type');
      mockError.code = 'INVALID_FILE_TYPE';
      ImageService.uploadImage.mockRejectedValue(mockError);

      // Act
      await ImageController.upload(req, res, next);

      // Assert
      expect(ImageService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle image validation errors', async () => {
      // Arrange
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        filename: 'test_123.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      req.file = mockFile;

      const mockError = new Error('Image dimensions too small (minimum 50x50 pixels)');
      ImageService.uploadImage.mockRejectedValue(mockError);

      // Act
      await ImageController.upload(req, res, next);

      // Assert
      expect(ImageService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getStatus', () => {
    it('should return image status successfully', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockStatus = {
        processingId: 'img_123456',
        status: 'processing'
      };
      ImageService.getImageStatus.mockResolvedValue(mockStatus);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith('img_123456');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockStatus
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return status for failed image with error', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockStatus = {
        processingId: 'img_123456',
        status: 'failed',
        error: {
          code: 'IMAGE_PROCESSING_FAILED',
          message: 'Unable to process image'
        }
      };
      ImageService.getImageStatus.mockResolvedValue(mockStatus);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith('img_123456');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockStatus
      });
    });

    it('should handle processing ID not found', async () => {
      // Arrange
      req.params.id = 'img_999999';
      ImageService.getImageStatus.mockResolvedValue(null);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith('img_999999');
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should handle service errors', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockError = new Error('Database connection failed');
      ImageService.getImageStatus.mockRejectedValue(mockError);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith('img_123456');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getResults', () => {
    it('should return completed results successfully', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockResults = {
        processingId: 'img_123456',
        status: 'completed',
        image: {
          width: 1920,
          height: 1080,
          format: 'jpeg',
          size: 245678
        },
        analysis: {
          blur: { detected: false, score: 182.4, threshold: 100 },
          brightness: { detected: true, averageBrightness: 42.8, classification: 'low_light' },
          duplicate: { detected: false, similarImageId: null, similarity: 0.12 },
          ocr: { text: 'KA01AB1234', confidence: 0.87 },
          numberPlate: { normalizedText: 'KA01AB1234', validFormat: true }
        },
        processedAt: '2026-08-09T10:00:00Z'
      };
      ImageService.getImageResults.mockResolvedValue(mockResults);

      // Act
      await ImageController.getResults(req, res, next);

      // Assert
      expect(ImageService.getImageResults).toHaveBeenCalledWith('img_123456');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResults
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return processing status when still processing', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockResults = {
        status: 'processing',
        message: 'Analysis is still in progress'
      };
      ImageService.getImageResults.mockResolvedValue(mockResults);

      // Act
      await ImageController.getResults(req, res, next);

      // Assert
      expect(ImageService.getImageResults).toHaveBeenCalledWith('img_123456');
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'processing',
        message: 'Analysis is still in progress'
      });
    });

    it('should return failed status with error', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockResults = {
        status: 'failed',
        error: {
          code: 'IMAGE_PROCESSING_FAILED',
          message: 'Unable to process image'
        }
      };
      ImageService.getImageResults.mockResolvedValue(mockResults);

      // Act
      await ImageController.getResults(req, res, next);

      // Assert
      expect(ImageService.getImageResults).toHaveBeenCalledWith('img_123456');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'failed',
        error: mockResults.error
      });
    });

    it('should handle processing ID not found', async () => {
      // Arrange
      req.params.id = 'img_999999';
      ImageService.getImageResults.mockResolvedValue(null);

      // Act
      await ImageController.getResults(req, res, next);

      // Assert
      expect(ImageService.getImageResults).toHaveBeenCalledWith('img_999999');
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should handle service errors', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockError = new Error('Redis connection failed');
      ImageService.getImageResults.mockRejectedValue(mockError);

      // Act
      await ImageController.getResults(req, res, next);

      // Assert
      expect(ImageService.getImageResults).toHaveBeenCalledWith('img_123456');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('retry', () => {
    it('should successfully retry a failed job', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockResult = {
        processingId: 'img_123456',
        status: 'pending',
        message: 'Retry initiated successfully'
      };
      ImageService.retryImage.mockResolvedValue(mockResult);

      // Act
      await ImageController.retry(req, res, next);

      // Assert
      expect(ImageService.retryImage).toHaveBeenCalledWith('img_123456');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle retry when processing ID not found', async () => {
      // Arrange
      req.params.id = 'img_999999';
      ImageService.retryImage.mockResolvedValue(null);

      // Act
      await ImageController.retry(req, res, next);

      // Assert
      expect(ImageService.retryImage).toHaveBeenCalledWith('img_999999');
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should handle retry when job is not failed', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockError = new Error('Only failed jobs can be retried');
      ImageService.retryImage.mockRejectedValue(mockError);

      // Act
      await ImageController.retry(req, res, next);

      // Assert
      expect(ImageService.retryImage).toHaveBeenCalledWith('img_123456');
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should handle service errors during retry', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockError = new Error('Queue service unavailable');
      ImageService.retryImage.mockRejectedValue(mockError);

      // Act
      await ImageController.retry(req, res, next);

      // Assert
      expect(ImageService.retryImage).toHaveBeenCalledWith('img_123456');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle non-Error objects thrown', async () => {
      // Arrange
      req.params.id = 'img_123456';
      ImageService.getImageStatus.mockRejectedValue('String error');

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith('String error');
    });

    it('should handle undefined processing ID', async () => {
      // Arrange
      req.params.id = undefined;
      ImageService.getImageStatus.mockResolvedValue(null);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith(undefined);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
    });

    it('should handle null processing ID', async () => {
      // Arrange
      req.params.id = null;
      ImageService.getImageStatus.mockResolvedValue(null);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith(null);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
    });

    it('should handle empty string processing ID', async () => {
      // Arrange
      req.params.id = '';
      ImageService.getImageStatus.mockResolvedValue(null);

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(ImageService.getImageStatus).toHaveBeenCalledWith('');
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Processing ID not found');
    });
  });

  describe('Integration with middleware', () => {
    it('should call next with error when upload service fails', async () => {
      // Arrange
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        filename: 'test_123.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      req.file = mockFile;
      const mockError = new Error('Service unavailable');
      ImageService.uploadImage.mockRejectedValue(mockError);

      // Act
      await ImageController.upload(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should properly handle async errors with next', async () => {
      // Arrange
      req.params.id = 'img_123456';
      const mockError = new Error('Async operation failed');
      ImageService.getImageStatus.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await ImageController.getStatus(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});