const express = require('express');
const { protect, authorize } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { certificationSchema, idValidation } = require('../../../shared/utils/validation');
const Joi = require('joi');

// Import controllers
const {
  createCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
  linkCertificationToProduct,
  unlinkCertificationFromProduct,
  getProductCertifications,
} = require('../controllers/certificationController');

const {
  getAllCertifications,
  getPendingCertifications,
  verifyCertification,
  getCertificationStats,
  bulkVerifyCertifications,
} = require('../controllers/adminController');

const router = express.Router();

// Validation schemas
const linkProductSchema = Joi.object({
  productId: idValidation,
});

const verifySchema = Joi.object({
  status: Joi.string().valid('VERIFIED', 'REJECTED').required(),
  notes: Joi.string().allow('').optional(),
});

const bulkVerifySchema = Joi.object({
  certificationIds: Joi.array().items(idValidation).min(1).required(),
  status: Joi.string().valid('VERIFIED', 'REJECTED').required(),
  notes: Joi.string().allow('').optional(),
});

// Public routes
router.get('/product/:productId', 
  validateParams({ productId: idValidation }), 
  getProductCertifications
);

// Protected routes
router.use(protect);

// User certification routes
router.route('/')
  .get(getCertifications)
  .post(authorize('SELLER'), validate(certificationSchema), createCertification);

router.route('/:id')
  .get(validateParams({ id: idValidation }), getCertification)
  .put(authorize('SELLER'), validateParams({ id: idValidation }), validate(certificationSchema), updateCertification)
  .delete(authorize('SELLER'), validateParams({ id: idValidation }), deleteCertification);

// Product certification linking
router.post('/:id/products',
  authorize('SELLER'),
  validateParams({ id: idValidation }),
  validate(linkProductSchema),
  linkCertificationToProduct
);

router.delete('/:id/products/:productId',
  authorize('SELLER'),
  validateParams({ 
    id: idValidation, 
    productId: idValidation 
  }),
  unlinkCertificationFromProduct
);

// Admin routes
router.use('/admin', authorize('ADMIN'));

router.get('/admin/certifications', getAllCertifications);
router.get('/admin/pending', getPendingCertifications);
router.get('/admin/stats', getCertificationStats);

router.put('/admin/:id/verify',
  validateParams({ id: idValidation }),
  validate(verifySchema),
  verifyCertification
);

router.put('/admin/bulk-verify',
  validate(bulkVerifySchema),
  bulkVerifyCertifications
);

module.exports = router;
