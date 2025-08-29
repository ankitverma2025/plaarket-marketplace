const { prisma } = require('../../../config/database');

// @desc    Get user's cart
// @route   GET /api/orders/cart
// @access  Private (Buyer)
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                companyName: true,
                isVerified: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    let subtotal = 0;
    const validCartItems = [];

    for (const item of cartItems) {
      // Check if product is still active and in stock
      if (item.product.isActive && item.product.stockQuantity >= item.quantity) {
        const itemTotal = parseFloat(item.product.retailPrice) * item.quantity;
        subtotal += itemTotal;
        validCartItems.push({
          ...item,
          itemTotal,
        });
      } else {
        // Remove invalid items from cart
        await prisma.cartItem.delete({
          where: { id: item.id },
        });
      }
    }

    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    res.json({
      success: true,
      data: {
        items: validCartItems,
        summary: {
          subtotal,
          tax,
          shipping,
          total,
          itemCount: validCartItems.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/orders/cart
// @access  Private (Buyer)
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or inactive' },
      });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient stock available' },
      });
    }

    // Check minimum order quantity
    if (quantity < product.minOrderQuantity) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Minimum order quantity is ${product.minOrderQuantity} ${product.unit}` 
        },
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot add more items. Insufficient stock available' },
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
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
    }

    res.status(201).json({
      success: true,
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/orders/cart/:id
// @access  Private (Buyer)
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cart item not found' },
      });
    }

    // Check stock availability
    if (cartItem.product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient stock available' },
      });
    }

    // Check minimum order quantity
    if (quantity < cartItem.product.minOrderQuantity) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Minimum order quantity is ${cartItem.product.minOrderQuantity} ${cartItem.product.unit}` 
        },
      });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
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

    res.json({
      success: true,
      data: updatedCartItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/orders/cart/:id
// @access  Private (Buyer)
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cart item not found' },
      });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Item removed from cart' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/orders/cart
// @access  Private (Buyer)
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      data: { message: 'Cart cleared successfully' },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
