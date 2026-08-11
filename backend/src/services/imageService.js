const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const imageQueue = require('../queue');
const Image = require('../models/Image');
const Analysis = require('../models/Analysis');

class ImageService {
  static async uploadImage(file) {
    try {
      // Generate processing ID
      const processingId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Validate image with sharp
      const metadata = await sharp(file.path).metadata();
      
      // Validate dimensions
      if (metadata.width < 50 || metadata.height < 50) {
        throw new Error('Image dimensions too small (minimum 50x50 pixels)');
      }
      if (metadata.width > 8000 || metadata.height > 8000) {
        throw new Error('Image dimensions too large (maximum 8000x8000 pixels)');
      }

      // Create image record
      const imageData = {
        processingId,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        status: 'pending'
      };

      const image = await Image.create(imageData);

      // Add to queue
      await imageQueue.add('process-image', {
        processingId,
        imagePath: file.path
      }, {
        jobId: processingId,
        removeOnComplete: true,
        removeOnFail: false
      });

      return {
        processingId,
        status: image.status,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      // Clean up file if it exists
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
      throw error;
    }
  }

  static async getImageStatus(processingId) {
    const image = await Image.findOne({ processingId });
    if (!image) {
      return null;
    }

    const response = {
      processingId: image.processingId,
      status: image.status
    };

    if (image.status === 'failed' && image.error) {
      response.error = image.error;
    }

    return response;
  }

  static async getImageResults(processingId) {
    const image = await Image.findOne({ processingId });
    if (!image) {
      return null;
    }

    if (image.status === 'processing') {
      return {
        status: 'processing',
        message: 'Analysis is still in progress'
      };
    }

    if (image.status === 'failed') {
      return {
        status: 'failed',
        error: image.error
      };
    }

    const analysis = await Analysis.findOne({ processingId });
    if (!analysis) {
      return {
        status: 'incomplete',
        message: 'Analysis results not found'
      };
    }

    return {
      processingId,
      status: image.status,
      image: {
        width: image.width,
        height: image.height,
        format: image.format,
        size: image.fileSize
      },
      analysis: {
        blur: analysis.blur,
        brightness: analysis.brightness,
        duplicate: analysis.duplicate,
        ocr: analysis.ocr,
        numberPlate: analysis.numberPlate
      },
      processedAt: image.processedAt
    };
  }

  static async retryImage(processingId) {
    const image = await Image.findOne({ processingId });
    
    if (!image) {
      return null;
    }

    if (image.status !== 'failed') {
      throw new Error('Only failed jobs can be retried');
    }

    // Reset status
    await Image.findOneAndUpdate(
      { processingId },
      {
        status: 'pending',
        error: null,
        processedAt: null
      }
    );

    // Add to queue
    await imageQueue.add('process-image', {
      processingId,
      imagePath: image.filePath
    }, {
      jobId: processingId,
      removeOnComplete: true,
      removeOnFail: false
    });

    return {
      processingId,
      status: 'pending',
      message: 'Retry initiated successfully'
    };
  }

  static async cleanupOldFiles(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const images = await Image.find({
      status: 'completed',
      processedAt: { $lt: cutoffDate }
    });

    for (const img of images) {
      try {
        if (fs.existsSync(img.filePath)) {
          fs.unlinkSync(img.filePath);
        }
      } catch (error) {
        console.error(`Failed to delete file ${img.filePath}:`, error);
      }
    }

    return images.length;
  }
}

module.exports = ImageService;