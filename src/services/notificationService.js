const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');
const rabbitMQ = require('../queue/rabbitmq');
const logger = require('../config/logger');

const MAX_RETRIES = 3;

// Create a new notification
const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create notification in database
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata,
      status: 'pending'
    });
    
    await notification.save();
    
    // Send to appropriate queue for processing
    const queueName = `${type}_notifications`;
    await rabbitMQ.publishToQueue(queueName, { notificationId: notification._id });
    
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Notification.countDocuments({ userId });
    
    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting user notifications: ${error.message}`);
    throw error;
  }
};

// Process notification
const processNotification = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    if (notification.status === 'sent' || notification.status === 'delivered') {
      return { success: true, status: notification.status };
    }
    
    const user = await User.findById(notification.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let result = { success: false };
    
    switch (notification.type) {
      case 'email':
        result = await emailService.sendEmail(user.email, notification.title, notification.message);
        break;
      case 'sms':
        if (user.phone) {
          result = await smsService.sendSMS(user.phone, notification.message);
        } else {
          throw new Error('User phone number not found');
        }
        break;
      case 'inApp':
        // For in-app notifications, we simply mark it as sent since it's already in the database
        result = { success: true };
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
    
    // Update notification status
    if (result.success) {
      notification.status = 'sent';
      await notification.save();
      return { success: true, status: 'sent' };
    } else {
      // Handle failure
      notification.status = 'failed';
      notification.retryCount += 1;
      
      if (notification.retryCount < MAX_RETRIES) {
        // Requeue for retry
        const queueName = `${notification.type}_notifications`;
        await rabbitMQ.publishToQueue(queueName, { notificationId: notification._id });
        
        logger.info(`Requeued notification ${notification._id} for retry (${notification.retryCount}/${MAX_RETRIES})`);
      } else {
        // Move to dead letter queue after max retries
        await rabbitMQ.publishToQueue('failed_notifications', { notificationId: notification._id });
        logger.warn(`Notification ${notification._id} failed after ${MAX_RETRIES} retries`);
      }
      
      await notification.save();
      return { success: false, error: result.error };
    }
  } catch (error) {
    logger.error(`Error processing notification: ${error.message}`);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.status = 'read';
    await notification.save();
    
    return notification;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  processNotification,
  markAsRead
}; 