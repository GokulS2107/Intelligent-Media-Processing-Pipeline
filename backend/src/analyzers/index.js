const analyzeBlur = require('./blurAnalyzer');
const analyzeBrightness = require('./brightnessAnalyzer');
const analyzeDuplicate = require('./duplicateAnalyzer');
const analyzeOCR = require('./ocrAnalyzer');
const analyzePlateValidation = require('./plateValidator');

module.exports = {
  analyzeBlur,
  analyzeBrightness,
  analyzeDuplicate,
  analyzeOCR,
  analyzePlateValidation
};