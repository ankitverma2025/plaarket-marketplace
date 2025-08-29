const { prisma } = require('../../../config/database');

// @desc    Get all certifications for review (admin only)
// @route   GET /api/certifications/admin/certifications
// @access  Private (Admin)
const getAllCertifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build filters
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          issuer: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              sellerProfile: {
                select: {
                  companyName: true,
                  contactPerson: true,
                  isVerified: true,
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

// @desc    Get pending certifications (admin only)
// @route   GET /api/certifications/admin/pending
// @access  Private (Admin)
const getPendingCertifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where: {
          status: 'PENDING',
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' }, // Oldest first for review queue
        include: {
          user: {
            select: {
              id: true,
              email: true,
              sellerProfile: {
                select: {
                  companyName: true,
                  contactPerson: true,
                  isVerified: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      prisma.certification.count({
        where: {
          status: 'PENDING',
        },
      }),
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

// @desc    Verify certification (admin only)
// @route   PUT /api/certifications/admin/:id/verify
// @access  Private (Admin)
const verifyCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    // Validate status
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status. Must be VERIFIED or REJECTED' },
      });
    }

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

    // Update certification
    const updatedCertification = await prisma.certification.update({
      where: { id },
      data: {
        status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            sellerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    // Create notification for the seller
    const notificationTitle = status === 'VERIFIED' 
      ? 'Certification Verified' 
      : 'Certification Rejected';
    
    const notificationMessage = status === 'VERIFIED'
      ? `Your certification "${certification.name}" has been verified and approved`
      : `Your certification "${certification.name}" has been rejected. ${notes || 'Please review and resubmit if necessary.'}`;

    await prisma.notification.create({
      data: {
        userId: certification.user.id,
        type: 'CERTIFICATION_UPDATE',
        title: notificationTitle,
        message: notificationMessage,
        data: {
          certificationId: id,
          certificationName: certification.name,
          status,
          notes,
        },
      },
    });

    res.json({
      success: true,
      data: updatedCertification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certification statistics (admin only)
// @route   GET /api/certifications/admin/stats
// @access  Private (Admin)
const getCertificationStats = async (req, res, next) => {
  try {
    const [
      totalCertifications,
      pendingCertifications,
      verifiedCertifications,
      rejectedCertifications,
      recentCertifications,
      topIssuers,
    ] = await Promise.all([
      prisma.certification.count(),
      prisma.certification.count({ where: { status: 'PENDING' } }),
      prisma.certification.count({ where: { status: 'VERIFIED' } }),
      prisma.certification.count({ where: { status: 'REJECTED' } }),
      prisma.certification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              sellerProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
      }),
      prisma.certification.groupBy({
        by: ['issuer'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCertifications,
          pendingCertifications,
          verifiedCertifications,
          rejectedCertifications,
        },
        recentActivity: {
          recentCertifications,
        },
        insights: {
          topIssuers: topIssuers.map(issuer => ({
            name: issuer.issuer,
            count: issuer._count.id,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk verify certifications (admin only)
// @route   PUT /api/certifications/admin/bulk-verify
// @access  Private (Admin)
const bulkVerifyCertifications = async (req, res, next) => {
  try {
    const { certificationIds, status, notes } = req.body;
    const adminId = req.user.id;

    // Validate status
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status. Must be VERIFIED or REJECTED' },
      });
    }

    if (!Array.isArray(certificationIds) || certificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'certificationIds must be a non-empty array' },
      });
    }

    // Get certifications to update
    const certifications = await prisma.certification.findMany({
      where: {
        id: {
          in: certificationIds,
        },
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (certifications.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'No pending certifications found with provided IDs' },
      });
    }

    // Update certifications in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update certifications
      const updated = await tx.certification.updateMany({
        where: {
          id: {
            in: certifications.map(c => c.id),
          },
        },
        data: {
          status,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          notes,
        },
      });

      // Create notifications
      const notifications = certifications.map(cert => ({
        userId: cert.user.id,
        type: 'CERTIFICATION_UPDATE',
        title: status === 'VERIFIED' ? 'Certification Verified' : 'Certification Rejected',
        message: status === 'VERIFIED'
          ? `Your certification "${cert.name}" has been verified and approved`
          : `Your certification "${cert.name}" has been rejected. ${notes || 'Please review and resubmit if necessary.'}`,
        data: {
          certificationId: cert.id,
          certificationName: cert.name,
          status,
          notes,
        },
      }));

      await tx.notification.createMany({
        data: notifications,
      });

      return updated;
    });

    res.json({
      success: true,
      data: {
        message: `Successfully ${status.toLowerCase()} ${result.count} certifications`,
        updated: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCertifications,
  getPendingCertifications,
  verifyCertification,
  getCertificationStats,
  bulkVerifyCertifications,
};
