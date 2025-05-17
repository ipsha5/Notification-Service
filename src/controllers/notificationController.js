const logger = require('../config/logger');

// Send a notification
const sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, title, and message are required'
      });
    }
    
    // Validate notification type
    if (!['email', 'sms', 'inApp'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type. Must be one of: email, sms, inApp'
      });
    }
    
    // Check if user exists
    const user = global.users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Create notification
    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      metadata: metadata || {},
      status: 'sent', // Simulating direct send without queue
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    global.notifications.push(notification);
    
    // Log the notification (simulating sending)
    logger.info(`Notification sent: ${type} to user ${userId}: ${title}`);
    
    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Error sending notification: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error sending notification'
    });
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Check if user exists
    const user = global.users.find(user => user.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userNotifications = global.notifications
      .filter(notification => notification.userId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        total: userNotifications.length,
        page,
        limit,
        pages: Math.ceil(userNotifications.length / limit)
      }
    });
  } catch (error) {
    logger.error(`Error getting user notifications: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error getting notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationIndex = global.notifications.findIndex(
      notification => notification.id === id
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    const notification = global.notifications[notificationIndex];
    notification.status = 'read';
    notification.updatedAt = new Date();
    
    global.notifications[notificationIndex] = notification;
    
    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error marking notification as read'
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead
}; 