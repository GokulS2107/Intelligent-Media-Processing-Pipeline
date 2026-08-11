const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { createWorker } = require('../queue/processor');
const connectDB = require('../config/database');

async function startWorker() {
  try {
    // Connect to database
    await connectDB();
    
    // Create and start worker
    const worker = createWorker();
    
    console.log('Image processing worker started');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down worker...');
      await worker.close();
      await mongoose.connection.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down worker...');
      await worker.close();
      await mongoose.connection.close();
      process.exit(0);
    });

    // Handle worker errors
    worker.on('error', (error) => {
      console.error('Worker error:', error);
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed:`, error.message);
    });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    worker.on('stalled', (jobId) => {
      console.warn(`Job ${jobId} stalled`);
    });

  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();