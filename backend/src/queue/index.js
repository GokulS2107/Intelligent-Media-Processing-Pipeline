const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

const imageQueue = new Queue('imageProcessing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      age: 86400, // Keep for 24 hours
      count: 1000
    },
    removeOnFail: {
      age: 604800 // Keep for 7 days
    }
  }
});

module.exports = imageQueue;