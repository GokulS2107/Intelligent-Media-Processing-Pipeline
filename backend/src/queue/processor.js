const { Worker } = require('bullmq');
const path = require('path');
const redisConnection = require('../config/redis');
const Image = require('../models/Image');
const Analysis = require('../models/Analysis');
const { 
  analyzeBlur, 
  analyzeBrightness, 
  analyzeDuplicate, 
  analyzeOCR,
  analyzePlateValidation 
} = require('../analyzers');

// Import in a separate file to avoid circular dependencies
const processImage = async (job) => {
  const { processingId } = job.data;
  
  try {
    console.log(`Processing image: ${processingId}`);
    
    // Update status to processing
    await Image.findOneAndUpdate(
      { processingId },
      { status: 'processing' }
    );

    // Get image metadata
    const image = await Image.findOne({ processingId });
    if (!image) {
      throw new Error(`Image not found: ${processingId}`);
    }

    const imagePath = path.join(process.cwd(), image.filePath);

    // Run all analyzers
    console.log(`Starting analysis for: ${processingId}`);
    
    const [blur, brightness, duplicate, ocr] = await Promise.all([
      analyzeBlur(imagePath),
      analyzeBrightness(imagePath),
      analyzeDuplicate(imagePath, processingId),
      analyzeOCR(imagePath)
    ]);

    // Validate plate
    const numberPlate = await analyzePlateValidation(ocr.text, ocr.confidence);

    // Store analysis results
    const analysisData = {
      processingId,
      blur,
      brightness,
      duplicate,
      ocr,
      numberPlate
    };

    await Analysis.findOneAndUpdate(
      { processingId },
      analysisData,
      { upsert: true, new: true }
    );

    // Update image status to completed
    await Image.findOneAndUpdate(
      { processingId },
      { 
        status: 'completed',
        processedAt: new Date()
      }
    );

    console.log(`Completed processing: ${processingId}`);
    
    return { processingId, status: 'completed' };
  } catch (error) {
    console.error(`Processing failed for ${processingId}:`, error);
    
    // Update status to failed
    await Image.findOneAndUpdate(
      { processingId },
      {
        status: 'failed',
        error: {
          code: 'IMAGE_PROCESSING_FAILED',
          message: error.message || 'Unknown error occurred',
          details: error.stack
        }
      }
    );
    
    throw error;
  }
};

const createWorker = () => {
  return new Worker('imageProcessing', processImage, {
    connection: redisConnection,
    concurrency: 5,
    stalledInterval: 30000,
    maxStalledCount: 3,
    lockDuration: 60000,
  });
};

module.exports = {
  createWorker,
  processImage
};