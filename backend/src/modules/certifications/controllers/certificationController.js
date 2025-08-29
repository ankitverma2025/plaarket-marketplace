const { prisma } = require('../../../config/database');

// @desc    Create certification
// @route   POST /api/certifications
// @access  Private (Seller)
const createCertification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      issuer,
      issueDate,
      expiryDate,
      documentUrl,
    } = req.body;

    const certification = await prisma.certification.create({
      data: {
        userId,
        name,
        description,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentUrl,
        status: 'PENDING',
      },
    });

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'CERTIFICATION_UPDATE',
      title: 'New Certification Pending Review',
      message: `A new certification "${name}" has been submitted for verification`,
      data: {
        certificationId: certification.id,
        certificationName: name,
        submittedBy: req.user.email,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    res.status(201).json({
      success: true,
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's certifications
// @route   GET /api/certifications
// @access  Private
const getCertifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
            },
          },
        },
      }),
      prisma.certification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        certifications,
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

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Private
const getCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const certification = await prisma.certification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            sellerProfile: {
              select: {
                companyName: true,
                contactPerson: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Certification not found' },
      });
    }

    // Check access permissions
    const isOwner = certification.userId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' },
      });
    }

    res.json({
      success: true,
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private (Seller - own certifications only)
const updateCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if certification exists and belongs to user
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCertification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Certification not found or access denied' },
      });
    }

    // Don't allow updates to verified certifications
    if (existingCertification.status === 'VERIFIED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update verified certification' },
      });
    }

    const certification = await prisma.certification.update({
      where: { id },
      data: {
        ...req.body,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        status: 'PENDING', // Reset to pending when updated
        verifiedBy: null,
        verifiedAt: null,
        notes: null,
      },
    });

    res.json({
      success: true,
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private (Seller - own certifications only)
const deleteCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if certification exists and belongs to user
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCertification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Certification not found or access denied' },
      });
    }

    // Check if certification is linked to products
    const linkedProducts = await prisma.productCertification.count({
      where: { certificationId: id },
    });

    if (linkedProducts > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete certification that is linked to products' },
      });
    }

    await prisma.certification.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Certification deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Link certification to product
// @route   POST /api/certifications/:id/products
// @access  Private (Seller)
const linkCertificationToProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if certification exists and belongs to user
    const certification = await prisma.certification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Certification not found or access denied' },
      });
    }

    // Check if certification is verified
    if (certification.status !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only verified certifications can be linked to products' },
      });
    }

    // Check if product exists and belongs to user (through seller profile)
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        seller: {
          userId,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or access denied' },
      });
    }

    // Check if link already exists
    const existingLink = await prisma.productCertification.findUnique({
      where: {
        productId_certificationId: {
          productId,
          certificationId: id,
        },
      },
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        error: { message: 'Certification is already linked to this product' },
      });
    }

    // Create the link
    const link = await prisma.productCertification.create({
      data: {
        productId,
        certificationId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: link,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlink certification from product
// @route   DELETE /api/certifications/:id/products/:productId
// @access  Private (Seller)
const unlinkCertificationFromProduct = async (req, res, next) => {
  try {
    const { id, productId } = req.params;
    const userId = req.user.id;

    // Check if certification exists and belongs to user
    const certification = await prisma.certification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Certification not found or access denied' },
      });
    }

    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        seller: {
          userId,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or access denied' },
      });
    }

    // Remove the link
    await prisma.productCertification.deleteMany({
      where: {
        productId,
        certificationId: id,
      },
    });

    res.json({
      success: true,
      data: { message: 'Certification unlinked from product successfully' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public certifications for a product
// @route   GET /api/certifications/product/:productId
// @access  Public
const getProductCertifications = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const certifications = await prisma.certification.findMany({
      where: {
        status: 'VERIFIED',
        products: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        issuer: true,
        issueDate: true,
        expiryDate: true,
        documentUrl: true,
        verifiedAt: true,
      },
      orderBy: { verifiedAt: 'desc' },
    });

    res.json({
      success: true,
      data: certifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
  linkCertificationToProduct,
  unlinkCertificationFromProduct,
  getProductCertifications,
};
