require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const imageRoutes = require('./routes/imageRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Debug environment
console.log('App loaded with environment:');
console.log('- MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('- UPLOAD_DIR:', process.env.UPLOAD_DIR || './uploads');

// Get upload directory from environment
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadPath = path.resolve(process.cwd(), uploadDir);

console.log('📁 Current working directory:', process.cwd());
console.log('📁 Upload directory path:', uploadPath);

// Ensure uploads directory exists
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('✅ Created uploads directory at:', uploadPath);
  } else {
    console.log('✅ Uploads directory already exists at:', uploadPath);
    // List existing files
    const files = fs.readdirSync(uploadPath);
    console.log('📂 Existing files:', files.filter(f => f !== '.gitkeep'));
  }
} catch (error) {
  console.error('❌ Error creating uploads directory:', error);
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });
  next();
});

// ============================================
// ROOT ROUTE - API Information
// ============================================
app.get('/', (req, res) => {
  res.json({
    name: 'Intelligent Media Processing Pipeline API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      upload: 'POST /api/images/upload',
      status: 'GET /api/images/:id/status',
      results: 'GET /api/images/:id/results',
      retry: 'POST /api/images/:id/retry',
      list: 'GET /api/images',
      stats: 'GET /api/images/stats',
      health: 'GET /health'
    },
    documentation: 'See README.md for more information'
  });
});

// ============================================
// API INFO ROUTE
// ============================================
app.get('/api', (req, res) => {
  res.json({
    name: 'Intelligent Media Processing Pipeline API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/images/upload',
      status: 'GET /api/images/:id/status',
      results: 'GET /api/images/:id/results',
      retry: 'POST /api/images/:id/retry',
      list: 'GET /api/images',
      stats: 'GET /api/images/stats'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ============================================
// SERVE UPLOADED FILES
// ============================================
console.log('🖼️ Setting up static file serving for uploads...');

// Try static file serving first
if (fs.existsSync(uploadPath)) {
  console.log('✅ Upload path exists, serving static files from:', uploadPath);
  
  app.use('/uploads', express.static(uploadPath, {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    index: false,
    maxAge: '1d',
    setHeaders: (res, path) => {
      res.set('Access-Control-Allow-Origin', '*');
    }
  }));
  
  console.log('✅ Static file serving configured for /uploads');
} else {
  console.error('❌ Upload path does not exist:', uploadPath);
}

// ============================================
// MANUAL FILE SERVER FOR UPLOADS (FALLBACK)
// ============================================
// This handles individual file requests when static serving fails
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Security: Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(403).json({ error: 'Invalid filename' });
  }
  
  const filepath = path.join(uploadPath, filename);
  
  console.log('📂 Requested file:', filename);
  console.log('📁 Full path:', filepath);
  
  // Check if file exists and is a file
  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    console.log('✅ Sending file:', filename);
    res.sendFile(filepath);
  } else {
    console.error('❌ File not found:', filename);
    res.status(404).json({ error: 'File not found' });
  }
});

// ============================================
// UPLOADS DIRECTORY LISTING
// ============================================
app.get('/uploads/', (req, res) => {
  try {
    const files = fs.readdirSync(uploadPath)
      .filter(f => f !== '.gitkeep')
      .map(file => {
        const stats = fs.statSync(path.join(uploadPath, file));
        return {
          name: file,
          url: `/uploads/${file}`,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    res.json({
      success: true,
      count: files.length,
      path: uploadPath,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DEBUG UPLOADS LIST
// ============================================
app.get('/uploads-list', (req, res) => {
  try {
    if (!fs.existsSync(uploadPath)) {
      return res.json({
        success: false,
        error: 'Uploads directory does not exist',
        path: uploadPath
      });
    }
    
    const files = fs.readdirSync(uploadPath);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        url: `/uploads/${file}`,
        size: stats.size,
        modified: stats.mtime,
        isFile: stats.isFile()
      };
    });
    
    res.json({
      success: true,
      count: files.length,
      path: uploadPath,
      files: fileDetails
    });
  } catch (error) {
    console.error('❌ Error listing uploads:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      path: uploadPath
    });
  }
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/images', imageRoutes);

// ============================================
// 404 HANDLER FOR UNDEFINED ROUTES
// ============================================
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Database connected successfully');

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Upload directory: ${uploadPath}`);
      console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API info: http://localhost:${PORT}/api`);
      console.log(`🏠 Root: http://localhost:${PORT}/`);
      console.log(`🖼️ Uploads: http://localhost:${PORT}/uploads/`);
      console.log(`📂 Uploads list: http://localhost:${PORT}/uploads-list`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}, starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          console.log('MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = { app, startServer };