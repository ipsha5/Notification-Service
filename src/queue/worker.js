const mongoose = require('mongoose');
const amqp = require('amqplib');
const logger = require('../config/logger');
const notificationService = require('../services/notificationService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-service')
  .then(() => logger.info('Worker connected to MongoDB'))
  .catch(err => {
    logger.error(`Worker MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

// Process notifications from queues
const processQueue = async (queueName) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertQueue(queueName, { durable: true });
    logger.info(`Worker waiting for messages in ${queueName}`);
    
    // Prefetch only one message at a time
    channel.prefetch(1);
    
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          logger.info(`Processing notification ${content.notificationId} from ${queueName}`);
          
          await notificationService.processNotification(content.notificationId);
          
          // Acknowledge the message
          channel.ack(msg);
          logger.info(`Processed notification ${content.notificationId}`);
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`);
          // Negative acknowledge to requeue the message
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    logger.error(`Error in ${queueName} worker: ${error.message}`);
    setTimeout(() => processQueue(queueName), 5000); // Retry after 5 seconds
  }
};

// Start workers for each queue
const startWorkers = async () => {
  await processQueue('email_notifications');
  await processQueue('sms_notifications');
  await processQueue('inapp_notifications');
};

startWorkers();

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Worker shutting down');
  mongoose.connection.close().then(() => {
    logger.info('Worker disconnected from MongoDB');
    process.exit(0);
  });
});

module.exports = { startWorkers }; 