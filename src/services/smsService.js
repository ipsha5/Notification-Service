const logger = require('../config/logger');

// In a real-world application, you would integrate with an SMS provider like Twilio, MessageBird, etc.
// For this example, we'll simulate sending SMS
const sendSMS = async (phoneNumber, message) => {
  try {
    // Simulate sending SMS with a 1-second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the SMS details (in production, you would use an actual SMS API)
    logger.info(`SMS sent to ${phoneNumber}: ${message}`);
    
    // Return success result
    return { success: true, messageId: `sms_${Date.now()}` };
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS
}; 