const { prisma } = require('../../../config/database');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      isOrganic,
      isFairTrade,
      isGmoFree,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      sellerId,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = {
      isActive: true,
    };

    // Search filter
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    // Category filter
    if (category) {
      where.categoryId = category;
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.retailPrice = {};
      if (minPrice) where.retailPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.retailPrice.lte = parseFloat(maxPrice);
    }

    // Certification filters
    if (isOrganic !== undefined) {
      where.isOrganic = isOrganic === 'true';
    }
    if (isFairTrade !== undefined) {
      where.isFairTrade = isFairTrade === 'true';
    }
    if (isGmoFree !== undefined) {
      where.isGmoFree = isGmoFree === 'true';
    }

    // Seller filter
    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Build sort order
    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.retailPrice = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              companyName: true,
              isVerified: true,
            },
          },
          certifications: {
            include: {
              certification: {
                select: {
                  id: true,
                  name: true,
                  issuer: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            city: true,
            state: true,
            country: true,
            isVerified: true,
            description: true,
            establishedYear: true,
          },
        },
        certifications: {
          include: {
            certification: {
              select: {
                id: true,
                name: true,
                description: true,
                issuer: true,
                issueDate: true,
                expiryDate: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' },
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller)
const createProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.sellerProfile.id;
    
    // Check if seller is verified
    if (!req.user.sellerProfile.isVerified) {
      return res.status(403).json({
        success: false,
        error: { message: 'Your seller account must be verified to create products' },
      });
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        sellerId,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            companyName: true,
            isVerified: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller - own products only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.sellerProfile.id;

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        sellerId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or access denied' },
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            companyName: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller - own products only)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.sellerProfile.id;

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        sellerId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or access denied' },
      });
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      data: { message: 'Product deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller)
const getSellerProducts = async (req, res, next) => {
  try {
    const sellerId = req.user.sellerProfile.id;
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = { sellerId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              quantity: true,
              order: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
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

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Seller - own products only)
const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const sellerId = req.user.sellerProfile.id;

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        sellerId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or access denied' },
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stockQuantity: parseInt(stockQuantity) },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        seller: {
          isVerified: true,
        },
      },
      take: parseInt(limit),
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateProductStock,
  getFeaturedProducts,
};
