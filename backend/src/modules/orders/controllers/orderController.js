const { prisma } = require('../../../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private (Buyer)
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cart is empty' },
      });
    }

    // Validate stock availability and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const { product, quantity } = cartItem;

      // Check if product is still active
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: { message: `Product "${product.name}" is no longer available` },
        });
      }

      // Check stock availability
      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: { 
            message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}` 
          },
        });
      }

      const unitPrice = parseFloat(product.retailPrice);
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
        isWholesale: false,
      });
    }

    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: userId,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          paymentMethod,
          notes,
          status: 'PENDING',
          paymentStatus: 'pending',
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          orderId: newOrder.id,
          ...item,
        })),
      });

      // Update product stock
      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stockQuantity: {
              decrement: cartItem.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
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
    });

    // Create notifications for sellers
    const sellerIds = [...new Set(cartItems.map(item => item.product.seller.id))];
    for (const sellerId of sellerIds) {
      await prisma.notification.create({
        data: {
          userId: cartItems.find(item => item.product.seller.id === sellerId).product.seller.userId,
          type: 'ORDER_STATUS',
          title: 'New Order Received',
          message: `You have received a new order ${order.orderNumber}`,
          data: { orderId: order.id, orderNumber: order.orderNumber },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: completeOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private (Buyer)
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = { buyerId: userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  unit: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Buyer - own orders only)
const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    companyName: true,
                    contactPerson: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            buyerProfile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' },
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyer - own orders only)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' },
      });
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Order cannot be cancelled at this stage' },
      });
    }

    // Cancel order and restore stock in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    res.json({
      success: true,
      data: { message: 'Order cancelled successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's orders
// @route   GET /api/orders/seller/orders
// @access  Private (Seller)
const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.sellerProfile.id;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build where clause for orders containing seller's products
    const where = {
      items: {
        some: {
          product: {
            sellerId,
          },
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            where: {
              product: {
                sellerId,
              },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  unit: true,
                },
              },
            },
          },
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
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Update order status (seller)
// @route   PUT /api/orders/:id/status
// @access  Private (Seller)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.sellerProfile.id;

    // Validate status
    const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid order status' },
      });
    }

    // Check if order contains seller's products
    const order = await prisma.order.findFirst({
      where: {
        id,
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found or access denied' },
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create notification for buyer
    await prisma.notification.create({
      data: {
        userId: order.buyer.id,
        type: 'ORDER_STATUS',
        title: 'Order Status Updated',
        message: `Your order ${order.orderNumber} status has been updated to ${status.toLowerCase()}`,
        data: { orderId: order.id, orderNumber: order.orderNumber, status },
      },
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
};
