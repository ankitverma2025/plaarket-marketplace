const express = require('express');
const { protect, authorize, optionalAuth } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { productSchema, idValidation } = require('../../../shared/utils/validation');
const Joi = require('joi');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateProductStock,
  getFeaturedProducts,
} = require('../controllers/productController');

const router = express.Router();

// Stock update validation schema
const stockUpdateSchema = Joi.object({
  stockQuantity: Joi.number().integer().min(0).required(),
});

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', validateParams({ id: idValidation }), getProduct);

// Seller routes
router.use(protect);

router.post('/', 
  authorize('SELLER'), 
  validate(productSchema), 
  createProduct
);

router.get('/seller/my-products', 
  authorize('SELLER'), 
  getSellerProducts
);

router.put('/:id', 
  authorize('SELLER'),
  validateParams({ id: idValidation }),
  validate(productSchema),
  updateProduct
);

router.delete('/:id',
  authorize('SELLER'),
  validateParams({ id: idValidation }),
  deleteProduct
);

router.put('/:id/stock',
  authorize('SELLER'),
  validateParams({ id: idValidation }),
  validate(stockUpdateSchema),
  updateProductStock
);

module.exports = router;
