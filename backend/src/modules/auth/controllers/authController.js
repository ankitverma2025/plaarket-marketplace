const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../../config/database');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password, role = 'BUYER' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists with this email' },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status: role === 'BUYER' ? 'ACTIVE' : 'PENDING', // Sellers need approval
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        message: role === 'SELLER' 
          ? 'Registration successful. Your account is pending approval.' 
          : 'Registration successful.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        buyerProfile: true,
        sellerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    }

    // Check if account is active
    if (user.status === 'SUSPENDED') {
      return res.status(401).json({
        success: false,
        error: { message: 'Your account has been suspended' },
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(401).json({
        success: false,
        error: { message: 'Your account application was rejected' },
      });
    }

    if (user.status === 'PENDING' && user.role === 'SELLER') {
      return res.status(401).json({
        success: false,
        error: { message: 'Your account is pending approval' },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        buyerProfile: true,
        sellerProfile: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect' },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      data: { message: 'Password updated successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({
    success: true,
    data: { message: 'User logged out successfully' },
  });
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  logout,
};
