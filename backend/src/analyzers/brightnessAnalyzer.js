const sharp = require('sharp');

const analyzeBrightness = async (imagePath) => {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate average brightness
    let sum = 0;
    let count = 0;

    if (info.channels === 3) {
      // RGB image
      for (let i = 0; i < data.length; i += 3) {
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
        sum += brightness;
        count++;
      }
    } else {
      // Grayscale or other format
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
        count++;
      }
    }

    const averageBrightness = Math.round((sum / count) * 10) / 10;
    
    // Classify brightness
    let classification;
    let detected = false;
    
    if (averageBrightness < 30) {
      classification = 'too_dark';
      detected = true;
    } else if (averageBrightness > 230) {
      classification = 'too_bright';
      detected = true;
    } else {
      classification = 'acceptable';
      detected = false;
    }

    return {
      detected,
      averageBrightness,
      classification
    };
  } catch (error) {
    console.error('Brightness analysis error:', error);
    return {
      detected: false,
      averageBrightness: 0,
      classification: 'unknown',
      error: 'Failed to analyze brightness'
    };
  }
};

module.exports = analyzeBrightness;