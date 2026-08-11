const Redis = require('ioredis');

// Get Redis host from environment, fallback to localhost
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

console.log(`📡 Connecting to Redis at ${redisHost}:${redisPort}`);

const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redisConnection.on('ready', () => {
  console.log('✅ Redis is ready');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
  console.error('   Please make sure Redis is running on', redisHost, 'port', redisPort);
});

redisConnection.on('close', () => {
  console.log('⚠️ Redis connection closed');
});

redisConnection.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

module.exports = redisConnection;