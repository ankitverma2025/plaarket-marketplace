const { prisma } = require('../../../config/database');

// Generate unique RFQ number
const generateRFQNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RFQ-${timestamp}-${random}`;
};

// @desc    Create RFQ
// @route   POST /api/rfq
// @access  Private (Buyer)
const createRFQ = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const {
      title,
      description,
      categoryId,
      quantity,
      unit,
      budget,
      location,
      deliveryDate,
      expiresAt,
      requirements,
    } = req.body;

    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber: generateRFQNumber(),
        buyerId,
        title,
        description,
        categoryId,
        quantity,
        unit,
        budget: budget ? parseFloat(budget) : null,
        location,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        expiresAt: new Date(expiresAt),
        requirements,
        status: 'OPEN',
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            buyerProfile: {
              select: {
                firstName: true,
                lastName: true,
                company: true,
              },
            },
          },
        },
      },
    });

    // Find relevant sellers based on category and notify them
    let sellers = [];
    if (categoryId) {
      sellers = await prisma.sellerProfile.findMany({
        where: {
          isVerified: true,
          categories: {
            some: {
              categoryId,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } else {
      // If no category specified, notify all verified sellers
      sellers = await prisma.sellerProfile.findMany({
        where: {
          isVerified: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    }

    // Create notifications for relevant sellers
    const notifications = sellers.map(seller => ({
      userId: seller.user.id,
      type: 'RFQ_RECEIVED',
      title: 'New RFQ Available',
      message: `A new RFQ "${title}" has been posted that matches your business`,
      data: {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        title,
        quantity,
        unit,
        budget,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    res.status(201).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all RFQs
// @route   GET /api/rfq
// @access  Private (Seller - to see available RFQs)
const getRFQs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'OPEN',
      categoryId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = {
      status,
      expiresAt: {
        gt: new Date(), // Only show non-expired RFQs
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        {
          title: {
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
      ];
    }

    // Build sort order
    const orderBy = {};
    if (sortBy === 'budget') {
      orderBy.budget = sortOrder;
    } else if (sortBy === 'quantity') {
      orderBy.quantity = sortOrder;
    } else if (sortBy === 'expiresAt') {
      orderBy.expiresAt = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          buyer: {
            select: {
              id: true,
              buyerProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  company: true,
                  city: true,
                  state: true,
                  country: true,
                },
              },
            },
          },
          quotes: {
            select: {
              id: true,
              sellerId: true,
            },
          },
          _count: {
            select: {
              quotes: true,
            },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        rfqs,
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

// @desc    Get buyer's RFQs
// @route   GET /api/rfq/my-rfqs
// @access  Private (Buyer)
const getMyRFQs = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = { buyerId };
    if (status) {
      where.status = status;
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          quotes: {
            include: {
              seller: {
                select: {
                  id: true,
                  companyName: true,
                  contactPerson: true,
                  city: true,
                  state: true,
                  country: true,
                  isVerified: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              quotes: true,
            },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        rfqs,
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

// @desc    Get single RFQ
// @route   GET /api/rfq/:id
// @access  Private
const getRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            buyerProfile: {
              select: {
                firstName: true,
                lastName: true,
                company: true,
                city: true,
                state: true,
                country: true,
                phone: true,
              },
            },
          },
        },
        quotes: {
          include: {
            seller: {
              select: {
                id: true,
                companyName: true,
                contactPerson: true,
                city: true,
                state: true,
                country: true,
                isVerified: true,
                phone: true,
                website: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found' },
      });
    }

    // Check access permissions
    const isOwner = rfq.buyerId === userId;
    const hasQuoted = rfq.quotes.some(quote => quote.seller.userId === userId);

    if (!isOwner && !hasQuoted && req.user.role !== 'ADMIN') {
      // For sellers, only show limited information if they haven't quoted
      const { buyer, quotes, ...limitedRfq } = rfq;
      return res.json({
        success: true,
        data: {
          ...limitedRfq,
          buyer: {
            buyerProfile: {
              company: buyer.buyerProfile?.company,
              city: buyer.buyerProfile?.city,
              state: buyer.buyerProfile?.state,
              country: buyer.buyerProfile?.country,
            },
          },
          quotesCount: quotes.length,
        },
      });
    }

    res.json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update RFQ
// @route   PUT /api/rfq/:id
// @access  Private (Buyer - own RFQs only)
const updateRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    // Check if RFQ exists and belongs to buyer
    const existingRFQ = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId,
      },
    });

    if (!existingRFQ) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found or access denied' },
      });
    }

    // Don't allow updates if RFQ has quotes
    const quotesCount = await prisma.quote.count({
      where: { rfqId: id },
    });

    if (quotesCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update RFQ that already has quotes' },
      });
    }

    const rfq = await prisma.rFQ.update({
      where: { id },
      data: {
        ...req.body,
        deliveryDate: req.body.deliveryDate ? new Date(req.body.deliveryDate) : undefined,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      },
      include: {
        buyer: {
          select: {
            id: true,
            buyerProfile: {
              select: {
                firstName: true,
                lastName: true,
                company: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close RFQ
// @route   PUT /api/rfq/:id/close
// @access  Private (Buyer - own RFQs only)
const closeRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;
    const { selectedQuoteId } = req.body;

    // Check if RFQ exists and belongs to buyer
    const existingRFQ = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId,
      },
      include: {
        quotes: true,
      },
    });

    if (!existingRFQ) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found or access denied' },
      });
    }

    // If a quote is selected, mark it as selected
    if (selectedQuoteId) {
      const selectedQuote = existingRFQ.quotes.find(q => q.id === selectedQuoteId);
      if (!selectedQuote) {
        return res.status(400).json({
          success: false,
          error: { message: 'Selected quote not found' },
        });
      }

      await prisma.quote.update({
        where: { id: selectedQuoteId },
        data: { isSelected: true },
      });
    }

    // Close the RFQ
    const rfq = await prisma.rFQ.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    // Notify sellers about RFQ closure
    const notifications = existingRFQ.quotes.map(quote => ({
      userId: quote.seller.userId,
      type: 'RFQ_RECEIVED',
      title: 'RFQ Closed',
      message: `RFQ "${existingRFQ.title}" has been closed`,
      data: {
        rfqId: id,
        rfqNumber: existingRFQ.rfqNumber,
        isSelected: quote.id === selectedQuoteId,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    res.json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete RFQ
// @route   DELETE /api/rfq/:id
// @access  Private (Buyer - own RFQs only)
const deleteRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    // Check if RFQ exists and belongs to buyer
    const existingRFQ = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId,
      },
    });

    if (!existingRFQ) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found or access denied' },
      });
    }

    // Don't allow deletion if RFQ has quotes
    const quotesCount = await prisma.quote.count({
      where: { rfqId: id },
    });

    if (quotesCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete RFQ that has received quotes' },
      });
    }

    await prisma.rFQ.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'RFQ deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRFQ,
  getRFQs,
  getMyRFQs,
  getRFQ,
  updateRFQ,
  closeRFQ,
  deleteRFQ,
};
