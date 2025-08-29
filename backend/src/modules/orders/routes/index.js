const express = require('express');
const { protect, authorize } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { orderSchema, idValidation } = require('../../../shared/utils/validation');
const Joi = require('joi');

// Import controllers
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

// Validation schemas
const addToCartSchema = Joi.object({
  productId: idValidation,
  quantity: Joi.number().integer().positive().required(),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED').required(),
});

// Cart routes (Buyer only)
router.use('/cart', protect, authorize('BUYER'));
router.route('/cart')
  .get(getCart)
  .post(validate(addToCartSchema), addToCart)
  .delete(clearCart);

router.route('/cart/:id')
  .put(validateParams({ id: idValidation }), validate(updateCartItemSchema), updateCartItem)
  .delete(validateParams({ id: idValidation }), removeFromCart);

// Order routes
router.use(protect);

// Buyer order routes
router.route('/')
  .post(authorize('BUYER'), validate(orderSchema), createOrder)
  .get(authorize('BUYER'), getOrders);

router.get('/:id', 
  authorize('BUYER'), 
  validateParams({ id: idValidation }), 
  getOrder
);

router.put('/:id/cancel',
  authorize('BUYER'),
  validateParams({ id: idValidation }),
  cancelOrder
);

// Seller order routes
router.get('/seller/orders',
  authorize('SELLER'),
  getSellerOrders
);

router.put('/:id/status',
  authorize('SELLER'),
  validateParams({ id: idValidation }),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

module.exports = router;
