const Tesseract = require('tesseract.js');

const analyzeOCR = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Progress logging if needed
          }
        }
      }
    );

    const text = result.data.text.trim();
    const confidence = result.data.confidence / 100; // Normalize to 0-1

    return {
      text: text || null,
      confidence: Math.round(confidence * 100) / 100
    };
  } catch (error) {
    console.error('OCR analysis error:', error);
    return {
      text: null,
      confidence: 0,
      error: 'Failed to perform OCR'
    };
  }
};

module.exports = analyzeOCR;