const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  processingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  storedFilename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  width: Number,
  height: Number,
  format: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  processedAt: Date
}, {
  timestamps: true
});

// Index for status queries
imageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);