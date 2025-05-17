const amqp = require('amqplib');
const logger = require('../config/logger');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    // Create the notification queues
    await channel.assertQueue('email_notifications', { durable: true });
    await channel.assertQueue('sms_notifications', { durable: true });
    await channel.assertQueue('inapp_notifications', { durable: true });
    
    // Create the dead letter queue for failed notifications
    await channel.assertQueue('failed_notifications', { durable: true });
    
    logger.info('RabbitMQ Connected');
    return channel;
  } catch (error) {
    logger.error(`Error connecting to RabbitMQ: ${error.message}`);
    return null;
  }
};

const getChannel = () => {
  return channel;
};

const publishToQueue = async (queueName, data) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    
    const message = JSON.stringify(data);
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true
    });
    
    logger.info(`Message published to ${queueName}`);
    return true;
  } catch (error) {
    logger.error(`Error publishing to ${queueName}: ${error.message}`);
    return false;
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue
}; 