const { prisma } = require('../../../config/database');

// @desc    Get all users (admin only)
// @route   GET /api/users/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          buyerProfile: {
            select: {
              firstName: true,
              lastName: true,
              company: true,
            },
          },
          sellerProfile: {
            select: {
              companyName: true,
              contactPerson: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details (admin only)
// @route   GET /api/users/admin/users/:id
// @access  Private (Admin)
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        buyerProfile: true,
        sellerProfile: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        rfqs: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (admin only)
// @route   PUT /api/users/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status provided' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // If approving seller, update seller profile verification
    if (user.role === 'SELLER' && status === 'ACTIVE' && user.sellerProfile) {
      await prisma.sellerProfile.update({
        where: { userId: id },
        data: {
          isVerified: true,
          verificationNotes: notes || 'Approved by admin',
        },
      });
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'GENERAL',
        title: 'Account Status Update',
        message: `Your account status has been updated to ${status.toLowerCase()}`,
        data: { status, notes },
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending sellers (admin only)
// @route   GET /api/users/admin/sellers/pending
// @access  Private (Admin)
const getPendingSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'SELLER',
          status: 'PENDING',
        },
        skip,
        take,
        include: {
          sellerProfile: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.count({
        where: {
          role: 'SELLER',
          status: 'PENDING',
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        sellers,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats (admin only)
// @route   GET /api/users/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      totalRFQs,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'SELLER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'SELLER', status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.rFQ.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              email: true,
              buyerProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBuyers,
          totalSellers,
          pendingSellers,
          totalProducts,
          totalOrders,
          totalRFQs,
        },
        recentActivity: {
          recentOrders,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (admin only)
// @route   POST /api/users/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin only)
// @route   PUT /api/users/admin/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentId,
        isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getPendingSellers,
  getDashboardStats,
  createCategory,
  updateCategory,
};
