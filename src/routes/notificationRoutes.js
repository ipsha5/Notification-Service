const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Send a notification
 *     description: Send a notification to a user
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to send the notification to
 *               type:
 *                 type: string
 *                 description: The type of notification (email, sms, inApp)
 *                 enum: [email, sms, inApp]
 *               title:
 *                 type: string
 *                 description: The notification title
 *               message:
 *                 type: string
 *                 description: The notification message content
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for the notification
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/', notificationController.sendNotification);

/**
 * @swagger
 * /api/notifications/users/{id}/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Get all notifications for a specific user
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of notifications per page
 *     responses:
 *       200:
 *         description: A list of notifications
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id/notifications', notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router; 