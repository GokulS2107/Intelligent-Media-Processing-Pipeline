const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ImageController = require('../controllers/imageController');
const { 
  validateImageUpload, 
  validateStatusRequest,
  validateResultsRequest,
  validateRetryRequest,
  sanitizeFilename 
} = require('../middleware/validation');

/**
 * @route   POST /api/images/upload
 * @desc    Upload an image for processing
 * @access  Public
 * @param   {File} image - Image file (JPEG, PNG, WEBP)
 * @returns {Object} Processing ID and status
 */
router.post(
  '/upload',
  upload.single('image'),
  sanitizeFilename,
  validateImageUpload,
  ImageController.upload
);

/**
 * @route   GET /api/images/:id/status
 * @desc    Get processing status of an image
 * @access  Public
 * @param   {String} id - Processing ID
 * @returns {Object} Status information
 */
router.get(
  '/:id/status',
  validateStatusRequest,
  ImageController.getStatus
);

/**
 * @route   GET /api/images/:id/results
 * @desc    Get processing results of an image
 * @access  Public
 * @param   {String} id - Processing ID
 * @returns {Object} Complete analysis results
 */
router.get(
  '/:id/results',
  validateResultsRequest,
  ImageController.getResults
);

/**
 * @route   POST /api/images/:id/retry
 * @desc    Retry failed image processing
 * @access  Public
 * @param   {String} id - Processing ID
 * @returns {Object} New status
 */
router.post(
  '/:id/retry',
  validateRetryRequest,
  ImageController.retry
);

/**
 * @route   GET /api/images
 * @desc    List all images (optional, for development)
 * @access  Public
 * @returns {Array} List of images
 */
router.get('/', async (req, res, next) => {
  try {
    const Image = require('../models/Image');
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('processingId originalFilename status createdAt');
    
    res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/images/stats
 * @desc    Get processing statistics
 * @access  Public
 * @returns {Object} Statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const Image = require('../models/Image');
    
    const stats = await Image.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Image.countDocuments();
    
    res.json({
      success: true,
      total,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;