const analyzePlateValidation = async (ocrText, ocrConfidence) => {
  if (!ocrText || ocrText.length === 0) {
    return {
      extractedText: null,
      normalizedText: null,
      validFormat: false,
      confidence: 0
    };
  }

  // Clean text
  const cleaned = ocrText
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  // Indian vehicle number patterns
  const patterns = [
    /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, // Standard: KA01AB1234
    /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{3,4}$/, // With possible 3-4 digits
    /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, // Variations
  ];

  let validFormat = false;
  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      validFormat = true;
      break;
    }
  }

  return {
    extractedText: ocrText,
    normalizedText: cleaned || null,
    validFormat,
    confidence: validFormat ? Math.round(ocrConfidence * 100) / 100 : 0
  };
};

module.exports = analyzePlateValidation;