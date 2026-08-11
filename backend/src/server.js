// Load environment variables FIRST
require('dotenv').config();

// Debug: Check if env loaded
console.log('📋 Environment variables:');
console.log('- REDIS_HOST:', process.env.REDIS_HOST || '❌ NOT SET');
console.log('- REDIS_PORT:', process.env.REDIS_PORT || '❌ NOT SET');
console.log('- MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '❌ NOT SET');

const { startServer } = require('./app');

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = require('./app');