require('dotenv').config();

const Redis = require('ioredis');

console.log('🔍 Testing Redis connection...');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
console.log('REDIS_PORT:', process.env.REDIS_PORT || 6379);

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

redis.on('connect', () => {
  console.log('✅ Successfully connected to Redis!');
  redis.ping((err, result) => {
    if (err) {
      console.error('❌ Ping failed:', err);
    } else {
      console.log('✅ PING response:', result);
    }
    process.exit(0);
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis connection failed:', err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 5000);