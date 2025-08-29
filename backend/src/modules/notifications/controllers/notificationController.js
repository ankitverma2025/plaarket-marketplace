const { prisma } = require('../../../config/database');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take),
        },
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' },
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: {
        message: `Marked ${result.count} notifications as read`,
        updated: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' },
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
const deleteAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    res.json({
      success: true,
      data: {
        message: `Deleted ${result.count} read notifications`,
        deleted: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalNotifications,
      unreadNotifications,
      typeBreakdown,
      recentNotifications,
    ] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
      prisma.notification.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalNotifications,
          unreadNotifications,
          readNotifications: totalNotifications - unreadNotifications,
        },
        breakdown: typeBreakdown.map(item => ({
          type: item.type,
          count: item._count.id,
        })),
        recentActivity: recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // For now, return default preferences
    // In a real application, you'd store these in the database
    const preferences = {
      rfqNotifications: true,
      orderNotifications: true,
      certificationNotifications: true,
      generalNotifications: true,
      emailNotifications: false,
      pushNotifications: true,
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // For now, just return the preferences
    // In a real application, you'd store these in the database
    res.json({
      success: true,
      data: {
        message: 'Notification preferences updated successfully',
        preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private (Admin only)
const createNotification = async (req, res, next) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data,
    } = req.body;

    // Validate that the target user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Target user not found' },
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk notifications (admin only)
// @route   POST /api/notifications/bulk
// @access  Private (Admin only)
const sendBulkNotifications = async (req, res, next) => {
  try {
    const {
      userIds,
      type,
      title,
      message,
      data,
    } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'userIds must be a non-empty array' },
      });
    }

    // Validate that all target users exist
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Some target users were not found' },
      });
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      data: data || {},
    }));

    const result = await prisma.notification.createMany({
      data: notifications,
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully sent ${result.count} notifications`,
        created: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
