const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          buyerProfile: true,
          sellerProfile: true,
        },
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      if (req.user.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          error: { message: 'Account is not active' },
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        error: { message: 'Not authorized, token failed' },
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized, no token' },
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Insufficient permissions' },
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          buyerProfile: true,
          sellerProfile: true,
        },
      });
    } catch (error) {
      // If token is invalid, continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
