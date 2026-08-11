const ImageService = require('../services/imageService');

class ImageController {
  static async upload(req, res, next) {
    try {
      if (!req.file) {
        const error = new Error('No file uploaded');
        error.code = 'NO_FILE';
        throw error;
      }

      const result = await ImageService.uploadImage(req.file);
      
      res.status(202).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ImageService.getImageStatus(id);

      if (!result) {
        const error = new Error('Processing ID not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getResults(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ImageService.getImageResults(id);

      if (!result) {
        const error = new Error('Processing ID not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      if (result.status === 'processing') {
        return res.status(202).json({
          success: false,
          status: 'processing',
          message: 'Analysis is still in progress'
        });
      }

      if (result.status === 'failed') {
        return res.status(422).json({
          success: false,
          status: 'failed',
          error: result.error
        });
      }

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async retry(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ImageService.retryImage(id);

      if (!result) {
        const error = new Error('Processing ID not found');
        error.code = 'NOT_FOUND';
        error.status = 404;
        throw error;
      }

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ImageController;