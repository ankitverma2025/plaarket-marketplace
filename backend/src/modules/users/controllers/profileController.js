const { prisma } = require('../../../config/database');

// @desc    Create buyer profile
// @route   POST /api/users/profile/buyer
// @access  Private (Buyer)
const createBuyerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if profile already exists
    const existingProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Buyer profile already exists' },
      });
    }

    const profile = await prisma.buyerProfile.create({
      data: {
        userId,
        ...req.body,
      },
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create seller profile
// @route   POST /api/users/profile/seller
// @access  Private (Seller)
const createSellerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categories, ...profileData } = req.body;

    // Check if profile already exists
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Seller profile already exists' },
      });
    }

    // Create profile with categories in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create seller profile
      const profile = await tx.sellerProfile.create({
        data: {
          userId,
          ...profileData,
        },
      });

      // Add categories
      if (categories && categories.length > 0) {
        await tx.sellerCategory.createMany({
          data: categories.map((categoryId) => ({
            sellerId: profile.id,
            categoryId,
          })),
        });
      }

      return profile;
    });

    // Fetch profile with categories
    const profileWithCategories = await prisma.sellerProfile.findUnique({
      where: { id: result.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: profileWithCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update buyer profile
// @route   PUT /api/users/profile/buyer
// @access  Private (Buyer)
const updateBuyerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.buyerProfile.upsert({
      where: { userId },
      update: req.body,
      create: {
        userId,
        ...req.body,
      },
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update seller profile
// @route   PUT /api/users/profile/seller
// @access  Private (Seller)
const updateSellerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categories, ...profileData } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update seller profile
      const profile = await tx.sellerProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData,
        },
      });

      // Update categories if provided
      if (categories !== undefined) {
        // Remove existing categories
        await tx.sellerCategory.deleteMany({
          where: { sellerId: profile.id },
        });

        // Add new categories
        if (categories.length > 0) {
          await tx.sellerCategory.createMany({
            data: categories.map((categoryId) => ({
              sellerId: profile.id,
              categoryId,
            })),
          });
        }
      }

      return profile;
    });

    // Fetch updated profile with categories
    const profileWithCategories = await prisma.sellerProfile.findUnique({
      where: { id: result.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: profileWithCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer profile
// @route   GET /api/users/profile/buyer
// @access  Private (Buyer)
const getBuyerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.buyerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Buyer profile not found' },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller profile
// @route   GET /api/users/profile/seller
// @access  Private (Seller)
const getSellerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Seller profile not found' },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public seller profile
// @route   GET /api/users/sellers/:id
// @access  Public
const getPublicSellerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Seller profile not found' },
      });
    }

    // Only show verified sellers publicly
    if (!profile.isVerified) {
      return res.status(404).json({
        success: false,
        error: { message: 'Seller profile not found' },
      });
    }

    // Remove sensitive information
    const {
      businessLicense,
      taxId,
      bankAccountInfo,
      verificationNotes,
      ...publicProfile
    } = profile;

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/users/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' },
      ],
      include: {
        children: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBuyerProfile,
  createSellerProfile,
  updateBuyerProfile,
  updateSellerProfile,
  getBuyerProfile,
  getSellerProfile,
  getPublicSellerProfile,
  getCategories,
};
