const { prisma } = require('../../../config/database');

// @desc    Create quote for RFQ
// @route   POST /api/rfq/:rfqId/quotes
// @access  Private (Seller)
const createQuote = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const sellerId = req.user.sellerProfile.id;
    const {
      price,
      quantity,
      unit,
      deliveryTime,
      terms,
      notes,
    } = req.body;

    // Check if RFQ exists and is open
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found' },
      });
    }

    if (rfq.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        error: { message: 'RFQ is no longer accepting quotes' },
      });
    }

    // Check if RFQ has expired
    if (new Date() > rfq.expiresAt) {
      return res.status(400).json({
        success: false,
        error: { message: 'RFQ has expired' },
      });
    }

    // Check if seller has already quoted
    const existingQuote = await prisma.quote.findUnique({
      where: {
        rfqId_sellerId: {
          rfqId,
          sellerId,
        },
      },
    });

    if (existingQuote) {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already submitted a quote for this RFQ' },
      });
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        sellerId,
        price: parseFloat(price),
        quantity,
        unit,
        deliveryTime,
        terms,
        notes,
      },
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
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
      },
    });

    // Update RFQ status to QUOTED if this is the first quote
    const quotesCount = await prisma.quote.count({
      where: { rfqId },
    });

    if (quotesCount === 1) {
      await prisma.rFQ.update({
        where: { id: rfqId },
        data: { status: 'QUOTED' },
      });
    }

    // Create notification for buyer
    await prisma.notification.create({
      data: {
        userId: rfq.buyer.id,
        type: 'QUOTE_RECEIVED',
        title: 'New Quote Received',
        message: `You have received a new quote for RFQ "${rfq.title}"`,
        data: {
          rfqId,
          rfqNumber: rfq.rfqNumber,
          quoteId: quote.id,
          sellerName: quote.seller.companyName,
          price: quote.price,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quotes for RFQ
// @route   GET /api/rfq/:rfqId/quotes
// @access  Private (Buyer - own RFQs only)
const getQuotesForRFQ = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const buyerId = req.user.id;

    // Check if RFQ belongs to buyer
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: rfqId,
        buyerId,
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found or access denied' },
      });
    }

    const quotes = await prisma.quote.findMany({
      where: { rfqId },
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
            description: true,
            establishedYear: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's quotes
// @route   GET /api/rfq/seller/quotes
// @access  Private (Seller)
const getSellerQuotes = async (req, res, next) => {
  try {
    const sellerId = req.user.sellerProfile.id;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = { sellerId };

    // Filter by RFQ status if provided
    if (status) {
      where.rfq = {
        status,
      };
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              title: true,
              status: true,
              expiresAt: true,
              buyer: {
                select: {
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
            },
          },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        quotes,
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

// @desc    Update quote
// @route   PUT /api/rfq/quotes/:id
// @access  Private (Seller - own quotes only)
const updateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.sellerProfile.id;

    // Check if quote exists and belongs to seller
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        sellerId,
      },
      include: {
        rfq: true,
      },
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote not found or access denied' },
      });
    }

    // Check if RFQ is still open
    if (existingQuote.rfq.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update quote for closed RFQ' },
      });
    }

    // Check if RFQ has expired
    if (new Date() > existingQuote.rfq.expiresAt) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update quote for expired RFQ' },
      });
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
      },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            isVerified: true,
          },
        },
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            buyer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Create notification for buyer
    await prisma.notification.create({
      data: {
        userId: quote.rfq.buyer.id,
        type: 'QUOTE_RECEIVED',
        title: 'Quote Updated',
        message: `A quote for RFQ "${quote.rfq.title}" has been updated`,
        data: {
          rfqId: quote.rfqId,
          rfqNumber: quote.rfq.rfqNumber,
          quoteId: quote.id,
          sellerName: quote.seller.companyName,
          price: quote.price,
        },
      },
    });

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quote
// @route   DELETE /api/rfq/quotes/:id
// @access  Private (Seller - own quotes only)
const deleteQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.sellerProfile.id;

    // Check if quote exists and belongs to seller
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        sellerId,
      },
      include: {
        rfq: true,
      },
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote not found or access denied' },
      });
    }

    // Check if quote is selected
    if (existingQuote.isSelected) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete selected quote' },
      });
    }

    // Check if RFQ is still open
    if (existingQuote.rfq.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete quote for closed RFQ' },
      });
    }

    await prisma.quote.delete({
      where: { id },
    });

    // Check if this was the last quote for the RFQ
    const remainingQuotes = await prisma.quote.count({
      where: { rfqId: existingQuote.rfqId },
    });

    if (remainingQuotes === 0) {
      // Update RFQ status back to OPEN
      await prisma.rFQ.update({
        where: { id: existingQuote.rfqId },
        data: { status: 'OPEN' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Quote deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quote
// @route   GET /api/rfq/quotes/:id
// @access  Private
const getQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quote = await prisma.quote.findUnique({
      where: { id },
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
            description: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        rfq: {
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
        },
      },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote not found' },
      });
    }

    // Check access permissions
    const isRFQOwner = quote.rfq.buyerId === userId;
    const isQuoteOwner = quote.seller.user.id === userId;

    if (!isRFQOwner && !isQuoteOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuote,
  getQuotesForRFQ,
  getSellerQuotes,
  updateQuote,
  deleteQuote,
  getQuote,
};
