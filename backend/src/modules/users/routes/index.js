const express = require('express');
const { protect, authorize } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { 
  buyerProfileSchema, 
  sellerProfileSchema,
  idValidation,
} = require('../../../shared/utils/validation');

// Import controllers
const {
  createBuyerProfile,
  createSellerProfile,
  updateBuyerProfile,
  updateSellerProfile,
  getBuyerProfile,
  getSellerProfile,
  getPublicSellerProfile,
  getCategories,
} = require('../controllers/profileController');

const {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getPendingSellers,
  getDashboardStats,
  createCategory,
  updateCategory,
} = require('../controllers/adminController');

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/sellers/:id', 
  validateParams({ id: idValidation }), 
  getPublicSellerProfile
);

// Buyer profile routes
router.route('/profile/buyer')
  .get(protect, authorize('BUYER'), getBuyerProfile)
  .post(protect, authorize('BUYER'), validate(buyerProfileSchema), createBuyerProfile)
  .put(protect, authorize('BUYER'), validate(buyerProfileSchema), updateBuyerProfile);

// Seller profile routes
router.route('/profile/seller')
  .get(protect, authorize('SELLER'), getSellerProfile)
  .post(protect, authorize('SELLER'), validate(sellerProfileSchema), createSellerProfile)
  .put(protect, authorize('SELLER'), validate(sellerProfileSchema), updateSellerProfile);

// Admin routes
router.use('/admin', protect, authorize('ADMIN'));

router.get('/admin/users', getAllUsers);
router.get('/admin/users/:id', 
  validateParams({ id: idValidation }), 
  getUserDetails
);
router.put('/admin/users/:id/status', 
  validateParams({ id: idValidation }), 
  updateUserStatus
);
router.get('/admin/sellers/pending', getPendingSellers);
router.get('/admin/stats', getDashboardStats);

router.route('/admin/categories')
  .post(createCategory);
router.route('/admin/categories/:id')
  .put(validateParams({ id: idValidation }), updateCategory);

module.exports = router;
