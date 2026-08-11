const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  processingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    ref: 'Image'
  },
  blur: {
    detected: Boolean,
    score: Number,
    threshold: Number
  },
  brightness: {
    detected: Boolean,
    averageBrightness: Number,
    classification: String
  },
  duplicate: {
    detected: Boolean,
    similarImageId: String,
    similarity: Number
  },
  ocr: {
    text: String,
    confidence: Number
  },
  numberPlate: {
    extractedText: String,
    normalizedText: String,
    validFormat: Boolean,
    confidence: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);