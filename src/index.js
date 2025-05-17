const express = require('express');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const swagger = require('./swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// Add in-memory data stores since we're not using MongoDB
global.users = [];
global.notifications = [];

// Add sample data
const addSampleData = () => {
  // Sample users
  global.users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      preferences: {
        email: true,
        sms: true,
        inApp: true
      },
      createdAt: new Date()
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      preferences: {
        email: true,
        sms: false,
        inApp: true
      },
      createdAt: new Date()
    }
  ];

  // Sample notifications
  global.notifications = [
    {
      id: "1",
      userId: "1",
      type: "email",
      title: "Welcome to our service",
      message: "Thank you for signing up to our service",
      metadata: {},
      status: "sent",
      retryCount: 0,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "2",
      userId: "1",
      type: "inApp",
      title: "New feature available",
      message: "Check out our new features",
      metadata: {},
      status: "sent",
      retryCount: 0,
      createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      updatedAt: new Date(Date.now() - 43200000)
    },
    {
      id: "3",
      userId: "2",
      type: "email",
      title: "Your account summary",
      message: "Here is your monthly account summary",
      metadata: {},
      status: "sent",
      retryCount: 0,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 3600000)
    }
  ];

  logger.info('Added sample data: 2 users and 3 notifications');
};

// Add sample data
addSampleData();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Swagger documentation route
app.use('/api-docs', swagger.serve, swagger.setup);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Notification Service API',
    endpoints: {
      users: '/api/users',
      notifications: '/api/notifications',
      documentation: '/api-docs'
    }
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in standalone mode on port ${PORT}`);
  logger.info('Note: MongoDB and RabbitMQ connections are disabled for this demo');
  logger.info(`API Documentation available at: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server; 