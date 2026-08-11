const sharp = require('sharp');
const crypto = require('crypto');
const Image = require('../models/Image');
const Analysis = require('../models/Analysis');

/**
 * Perceptual hashing using simple average hash
 * Note: This is a heuristic approach and may produce false positives
 */
const analyzeDuplicate = async (imagePath, processingId) => {
  try {
    // Generate perceptual hash of current image
    const currentHash = await generatePerceptualHash(imagePath);
    
    // Get recent images (last 100) for comparison
    const recentImages = await Image.find({
      processingId: { $ne: processingId },
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('processingId');

    // Check for duplicates
    for (const img of recentImages) {
      const analysis = await Analysis.findOne({ processingId: img.processingId });
      if (!analysis || !analysis.duplicate) continue;

      // Compare hashes - simplified: check if we have stored hash
      // In production, would store hash in analysis document
      const similarity = calculateSimilarity(currentHash, analysis.duplicate.hash || currentHash);
      
      if (similarity > 0.9) {
        return {
          detected: true,
          similarImageId: img.processingId,
          similarity: Math.round(similarity * 100) / 100,
          hash: currentHash
        };
      }
    }

    return {
      detected: false,
      similarImageId: null,
      similarity: 0,
      hash: currentHash
    };
  } catch (error) {
    console.error('Duplicate analysis error:', error);
    return {
      detected: false,
      similarImageId: null,
      similarity: 0,
      error: 'Failed to analyze duplicates'
    };
  }
};

async function generatePerceptualHash(imagePath) {
  // Generate average hash
  const image = sharp(imagePath);
  const { data, info } = await image
    .resize(8, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert to grayscale if RGB
  let pixels = data;
  if (info.channels === 3) {
    const gray = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      const idx = i * 3;
      gray[i] = Math.round(data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114);
    }
    pixels = gray;
  }

  // Calculate average
  const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  
  // Generate hash
  let hash = '';
  for (let i = 0; i < pixels.length; i++) {
    hash += pixels[i] > avg ? '1' : '0';
  }
  
  return hash;
}

function calculateSimilarity(hash1, hash2) {
  if (hash1.length !== hash2.length) return 0;
  
  let differences = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) differences++;
  }
  
  return 1 - (differences / hash1.length);
}

module.exports = analyzeDuplicate;