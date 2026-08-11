const sharp = require('sharp');

/**
 * Detect image blur using Laplacian variance
 * Higher variance = sharper image
 * Lower variance = blurrier image
 */
const analyzeBlur = async (imagePath, threshold = 100) => {
  try {
    // Load image and convert to grayscale
    const image = sharp(imagePath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to grayscale if needed
    let grayData = data;
    if (info.channels === 3) {
      // Simple RGB to grayscale conversion
      const gray = new Uint8Array(info.width * info.height);
      for (let i = 0; i < data.length; i += 3) {
        const idx = i / 3;
        gray[idx] = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }
      grayData = gray;
    }

    // Calculate Laplacian variance
    const variance = calculateLaplacianVariance(grayData, info.width, info.height);
    const detected = variance < threshold;

    return {
      detected,
      score: Math.round(variance * 100) / 100,
      threshold
    };
  } catch (error) {
    console.error('Blur analysis error:', error);
    return {
      detected: false,
      score: 0,
      threshold: 100,
      error: 'Failed to analyze blur'
    };
  }
};

function calculateLaplacianVariance(grayData, width, height) {
  // Simple Laplacian approximation
  const laplacian = new Float32Array(grayData.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // 3x3 Laplacian kernel: [0,1,0; 1,-4,1; 0,1,0]
      const neighbors = [
        grayData[(y-1) * width + x],
        grayData[(y+1) * width + x],
        grayData[y * width + (x-1)],
        grayData[y * width + (x+1)]
      ];
      const center = grayData[idx];
      const sum = neighbors.reduce((a, b) => a + b, 0);
      laplacian[idx] = sum - 4 * center;
    }
  }

  // Calculate variance of laplacian
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance = laplacian.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / laplacian.length;
  return variance;
}

module.exports = analyzeBlur;