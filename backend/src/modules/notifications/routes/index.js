const express = require('express');
const { protect, authorize } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { idValidation } = require('../../../shared/utils/validation');
const Joi = require('joi');

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification,
  sendBulkNotifications,
} = require('../controllers/notificationController');

const router = express.Router();

// Validation schemas
const createNotificationSchema = Joi.object({
  userId: idValidation,
  type: Joi.string().valid('RFQ_RECEIVED', 'QUOTE_RECEIVED', 'ORDER_STATUS', 'CERTIFICATION_UPDATE', 'GENERAL').required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(1000).required(),
  data: Joi.object().optional(),
});

const bulkNotificationSchema = Joi.object({
  userIds: Joi.array().items(idValidation).min(1).required(),
  type: Joi.string().valid('RFQ_RECEIVED', 'QUOTE_RECEIVED', 'ORDER_STATUS', 'CERTIFICATION_UPDATE', 'GENERAL').required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(1000).required(),
  data: Joi.object().optional(),
});

const preferencesSchema = Joi.object({
  rfqNotifications: Joi.boolean().optional(),
  orderNotifications: Joi.boolean().optional(),
  certificationNotifications: Joi.boolean().optional(),
  generalNotifications: Joi.boolean().optional(),
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
});

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);

router.put('/mark-all-read', markAllAsRead);
router.delete('/read', deleteAllRead);

router.put('/:id/read',
  validateParams({ id: idValidation }),
  markAsRead
);

router.delete('/:id',
  validateParams({ id: idValidation }),
  deleteNotification
);

// Notification preferences
router.route('/preferences')
  .get(getNotificationPreferences)
  .put(validate(preferencesSchema), updateNotificationPreferences);

// Admin routes
router.post('/',
  authorize('ADMIN'),
  validate(createNotificationSchema),
  createNotification
);

router.post('/bulk',
  authorize('ADMIN'),
  validate(bulkNotificationSchema),
  sendBulkNotifications
);

module.exports = router;
