const logger = require('../config/logger');

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, phone, preferences } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    // Check if user with email already exists
    const existingUser = global.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      preferences: preferences || {
        email: true,
        sms: false,
        inApp: true
      },
      createdAt: new Date()
    };
    
    global.users.push(user);
    
    return res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error creating user'
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: global.users.length,
      data: global.users
    });
  } catch (error) {
    logger.error(`Error getting users: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error getting users'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = global.users.find(user => user.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error getting user'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, preferences } = req.body;
    
    const userIndex = global.users.findIndex(user => user.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = global.users[userIndex];
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    global.users[userIndex] = user;
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error updating user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userIndex = global.users.findIndex(user => user.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    global.users.splice(userIndex, 1);
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: 'Error deleting user'
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}; 