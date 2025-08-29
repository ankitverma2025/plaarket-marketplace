const Joi = require('joi');

// Common validation schemas
const idValidation = Joi.string().uuid().required();
const emailValidation = Joi.string().email().required();
const passwordValidation = Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

const phoneValidation = Joi.string().pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/).messages({
  'string.pattern.base': 'Please provide a valid phone number',
});

// Auth validation schemas
const registerSchema = Joi.object({
  email: emailValidation,
  password: passwordValidation,
  role: Joi.string().valid('BUYER', 'SELLER').default('BUYER'),
});

const loginSchema = Joi.object({
  email: emailValidation,
  password: Joi.string().required(),
});

// Profile validation schemas
const buyerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  company: Joi.string().max(100).allow(''),
  phone: phoneValidation.allow(''),
  address: Joi.string().max(255).allow(''),
  city: Joi.string().max(100).allow(''),
  state: Joi.string().max(100).allow(''),
  zipCode: Joi.string().max(20).allow(''),
  country: Joi.string().max(100).allow(''),
  companyType: Joi.string().valid('Individual', 'Small Business', 'Enterprise').allow(''),
});

const sellerProfileSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).required(),
  contactPerson: Joi.string().min(2).max(100).required(),
  phone: phoneValidation,
  address: Joi.string().max(255).required(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  zipCode: Joi.string().max(20).required(),
  country: Joi.string().max(100).required(),
  description: Joi.string().max(1000).allow(''),
  website: Joi.string().uri().allow(''),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  employeeCount: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').allow(''),
  businessLicense: Joi.string().max(100).allow(''),
  taxId: Joi.string().max(50).allow(''),
  categories: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  shortDescription: Joi.string().max(300).allow(''),
  categoryId: Joi.string().uuid().required(),
  sku: Joi.string().min(3).max(50).required(),
  retailPrice: Joi.number().positive().precision(2).required(),
  wholesalePrice: Joi.number().positive().precision(2).allow(null),
  minOrderQuantity: Joi.number().integer().positive().default(1),
  unit: Joi.string().max(20).required(),
  stockQuantity: Joi.number().integer().min(0).default(0),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  nutritionInfo: Joi.object().allow(null),
  storageInfo: Joi.string().max(500).allow(''),
  shelfLife: Joi.string().max(100).allow(''),
  origin: Joi.string().max(100).allow(''),
  harvestDate: Joi.date().allow(null),
  isOrganic: Joi.boolean().default(true),
  isFairTrade: Joi.boolean().default(false),
  isGmoFree: Joi.boolean().default(true),
});

// Order validation schemas
const orderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().positive().required(),
    isWholesale: Joi.boolean().default(false),
  })).min(1).required(),
  shippingAddress: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
    phone: phoneValidation.allow(''),
  }).required(),
  billingAddress: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
  }).allow(null),
  paymentMethod: Joi.string().allow(''),
  notes: Joi.string().max(500).allow(''),
});

// RFQ validation schemas
const rfqSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).max(2000).required(),
  categoryId: Joi.string().uuid().allow(null),
  quantity: Joi.number().integer().positive().required(),
  unit: Joi.string().max(20).required(),
  budget: Joi.number().positive().precision(2).allow(null),
  location: Joi.string().max(200).allow(''),
  deliveryDate: Joi.date().greater('now').allow(null),
  expiresAt: Joi.date().greater('now').required(),
  requirements: Joi.object().allow(null),
});

const quoteSchema = Joi.object({
  price: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().positive().required(),
  unit: Joi.string().max(20).required(),
  deliveryTime: Joi.string().max(100).allow(''),
  terms: Joi.string().max(1000).allow(''),
  notes: Joi.string().max(1000).allow(''),
});

// Certification validation schemas
const certificationSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  issuer: Joi.string().min(2).max(200).required(),
  issueDate: Joi.date().required(),
  expiryDate: Joi.date().greater(Joi.ref('issueDate')).allow(null),
  documentUrl: Joi.string().uri().required(),
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: { message: errorMessage },
      });
    }
    
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: { message: errorMessage },
      });
    }
    
    next();
  };
};

module.exports = {
  // Validation functions
  validate,
  validateParams,
  
  // Common validations
  idValidation,
  emailValidation,
  passwordValidation,
  phoneValidation,
  
  // Schemas
  registerSchema,
  loginSchema,
  buyerProfileSchema,
  sellerProfileSchema,
  productSchema,
  orderSchema,
  rfqSchema,
  quoteSchema,
  certificationSchema,
};
