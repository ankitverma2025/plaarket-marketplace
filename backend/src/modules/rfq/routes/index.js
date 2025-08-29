const express = require('express');
const { protect, authorize } = require('../../../shared/middleware/authMiddleware');
const { validate, validateParams } = require('../../../shared/utils/validation');
const { rfqSchema, quoteSchema, idValidation } = require('../../../shared/utils/validation');
const Joi = require('joi');

// Import controllers
const {
  createRFQ,
  getRFQs,
  getMyRFQs,
  getRFQ,
  updateRFQ,
  closeRFQ,
  deleteRFQ,
} = require('../controllers/rfqController');

const {
  createQuote,
  getQuotesForRFQ,
  getSellerQuotes,
  updateQuote,
  deleteQuote,
  getQuote,
} = require('../controllers/quoteController');

const router = express.Router();

// Validation schemas
const closeRFQSchema = Joi.object({
  selectedQuoteId: idValidation.optional(),
});

// All routes require authentication
router.use(protect);

// RFQ routes
router.route('/')
  .post(authorize('BUYER'), validate(rfqSchema), createRFQ)
  .get(authorize('SELLER'), getRFQs);

router.get('/my-rfqs', authorize('BUYER'), getMyRFQs);

router.route('/:id')
  .get(validateParams({ id: idValidation }), getRFQ)
  .put(authorize('BUYER'), validateParams({ id: idValidation }), validate(rfqSchema), updateRFQ)
  .delete(authorize('BUYER'), validateParams({ id: idValidation }), deleteRFQ);

router.put('/:id/close',
  authorize('BUYER'),
  validateParams({ id: idValidation }),
  validate(closeRFQSchema),
  closeRFQ
);

// Quote routes
router.post('/:rfqId/quotes',
  authorize('SELLER'),
  validateParams({ rfqId: idValidation }),
  validate(quoteSchema),
  createQuote
);

router.get('/:rfqId/quotes',
  authorize('BUYER'),
  validateParams({ rfqId: idValidation }),
  getQuotesForRFQ
);

router.get('/seller/quotes',
  authorize('SELLER'),
  getSellerQuotes
);

router.route('/quotes/:id')
  .get(validateParams({ id: idValidation }), getQuote)
  .put(authorize('SELLER'), validateParams({ id: idValidation }), validate(quoteSchema), updateQuote)
  .delete(authorize('SELLER'), validateParams({ id: idValidation }), deleteQuote);

module.exports = router;
