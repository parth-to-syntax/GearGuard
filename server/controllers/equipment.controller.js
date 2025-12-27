import prisma from '../config/database.js';

// Get all equipment
export const getEquipment = async (req, res) => {
  try {
    const { search, status, healthStatus, workCenterId, categoryId } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (healthStatus) {
      where.healthStatus = healthStatus;
    }

    if (workCenterId) {
      where.workCenterId = workCenterId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            maintenanceRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add counts
    const equipmentWithCounts = equipment.map(eq => ({
      ...eq,
      requestCount: eq._count.maintenanceRequests
    }));

    res.json({
      success: true,
      data: equipmentWithCounts
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Failed to fetch equipment' });
  }
};

// Get single equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        maintenanceRequests: {
          take: 10,
          orderBy: { reportedDate: 'desc' },
          select: {
            id: true,
            requestNumber: true,
            title: true,
            status: true,
            priority: true,
            reportedDate: true
          }
        },
        maintenanceHistory: {
          take: 10,
          orderBy: { performedDate: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            performedDate: true,
            duration: true,
            cost: true
          }
        },
        _count: {
          select: {
            maintenanceRequests: true,
            maintenanceHistory: true
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({
      success: true,
      data: {
        ...equipment,
        totalRequests: equipment._count.maintenanceRequests,
        totalMaintenanceRecords: equipment._count.maintenanceHistory
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Failed to fetch equipment' });
  }
};

// Create new equipment
export const createEquipment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      serialNumber,
      model,
      manufacturer,
      purchaseDate,
      warrantyExpiry,
      location,
      status,
      categoryId,
      workCenterId,
      departmentId,
      specifications,
      // New fields from design.json
      usedById,
      defaultTechnicianId,
      maintenanceTeamId,
      assignedDate,
      workContact
    } = req.body;

    // Check if code already exists
    const existingCode = await prisma.equipment.findUnique({
      where: { code }
    });

    if (existingCode) {
      return res.status(400).json({ message: 'Equipment with this code already exists' });
    }

    // Create equipment
    const equipment = await prisma.equipment.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        serialNumber,
        model,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        location,
        status: status || 'OPERATIONAL',
        categoryId,
        workCenterId,
        departmentId,
        specifications: specifications ? JSON.parse(specifications) : null,
        // New fields
        usedById,
        defaultTechnicianId,
        maintenanceTeamId,
        assignedDate: assignedDate ? new Date(assignedDate) : null,
        workContact
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        workCenter: {
          select: { id: true, name: true, code: true }
        },
        department: {
          select: { id: true, name: true }
        },
        usedBy: {
          select: { id: true, name: true, email: true }
        },
        defaultTechnician: {
          select: { id: true, name: true, email: true }
        },
        maintenanceTeam: {
          select: { id: true, name: true }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'EQUIPMENT_CREATED',
        entityType: 'Equipment',
        entityId: equipment.id,
        description: `Equipment "${equipment.name}" (${equipment.code}) was created`,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ message: 'Failed to create equipment' });
  }
};

// Update equipment
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      serialNumber,
      model,
      manufacturer,
      purchaseDate,
      warrantyExpiry,
      location,
      status,
      healthScore,
      healthStatus,
      categoryId,
      workCenterId,
      departmentId,
      specifications,
      // New fields from design.json
      usedById,
      defaultTechnicianId,
      maintenanceTeamId,
      assignedDate,
      workContact
    } = req.body;

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check for duplicate code
    if (code && code !== existingEquipment.code) {
      const duplicateCode = await prisma.equipment.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (duplicateCode) {
        return res.status(400).json({ message: 'Equipment with this code already exists' });
      }
    }

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        description,
        serialNumber,
        model,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
        location,
        status,
        healthScore: healthScore !== undefined ? parseInt(healthScore) : undefined,
        healthStatus,
        categoryId,
        workCenterId,
        departmentId,
        specifications: specifications ? JSON.parse(specifications) : undefined,
        // New fields
        usedById,
        defaultTechnicianId,
        maintenanceTeamId,
        assignedDate: assignedDate ? new Date(assignedDate) : undefined,
        workContact
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        workCenter: {
          select: { id: true, name: true, code: true }
        },
        department: {
          select: { id: true, name: true }
        },
        usedBy: {
          select: { id: true, name: true, email: true }
        },
        defaultTechnician: {
          select: { id: true, name: true, email: true }
        },
        maintenanceTeam: {
          select: { id: true, name: true }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'EQUIPMENT_UPDATED',
        entityType: 'Equipment',
        entityId: equipment.id,
        description: `Equipment "${equipment.name}" was updated`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ message: 'Failed to update equipment' });
  }
};

// Delete equipment
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            maintenanceRequests: true
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check for active maintenance requests
    const activeRequests = await prisma.maintenanceRequest.count({
      where: {
        equipmentId: id,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    if (activeRequests > 0) {
      return res.status(400).json({
        message: 'Cannot delete equipment with active maintenance requests. Complete or cancel them first.'
      });
    }

    // Delete equipment
    await prisma.equipment.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'EQUIPMENT_DELETED',
        entityType: 'Equipment',
        entityId: id,
        description: `Equipment "${equipment.name}" was deleted`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ message: 'Failed to delete equipment' });
  }
};

// Get equipment statistics
export const getEquipmentStats = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        maintenanceRequests: {
          select: {
            status: true,
            priority: true,
            actualHours: true,
            actualCost: true
          }
        },
        maintenanceHistory: {
          select: {
            type: true,
            duration: true,
            cost: true
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Calculate statistics
    const stats = {
      totalRequests: equipment.maintenanceRequests.length,
      completedRequests: equipment.maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
      pendingRequests: equipment.maintenanceRequests.filter(r =>
        ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS'].includes(r.status)
      ).length,
      criticalRequests: equipment.maintenanceRequests.filter(r =>
        r.priority === 'CRITICAL' && r.status !== 'COMPLETED'
      ).length,
      totalHoursSpent: equipment.maintenanceRequests.reduce((sum, r) => sum + (r.actualHours || 0), 0) +
        equipment.maintenanceHistory.reduce((sum, h) => sum + (h.duration || 0), 0),
      totalCost: equipment.maintenanceRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0) +
        equipment.maintenanceHistory.reduce((sum, h) => sum + (h.cost || 0), 0),
      maintenanceRecords: equipment.maintenanceHistory.length
    };

    // Request status breakdown
    stats.requestsByStatus = {
      draft: equipment.maintenanceRequests.filter(r => r.status === 'DRAFT').length,
      submitted: equipment.maintenanceRequests.filter(r => r.status === 'SUBMITTED').length,
      inProgress: equipment.maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: equipment.maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
      cancelled: equipment.maintenanceRequests.filter(r => r.status === 'CANCELLED').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json({ message: 'Failed to fetch equipment statistics' });
  }
};

// Generate next equipment code
export const generateCode = async (req, res) => {
  try {
    const { prefix = 'EQ' } = req.query;

    // Find the highest existing code with this prefix
    const lastEquipment = await prisma.equipment.findFirst({
      where: {
        code: {
          startsWith: prefix.toUpperCase()
        }
      },
      orderBy: { code: 'desc' }
    });

    let nextNumber = 1;
    if (lastEquipment) {
      const match = lastEquipment.code.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const nextCode = `${prefix.toUpperCase()}${String(nextNumber).padStart(4, '0')}`;

    res.json({
      success: true,
      data: { code: nextCode }
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: 'Failed to generate code' });
  }
};

// Get equipment categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.equipmentCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: { equipment: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// Update equipment health status
export const updateHealthStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { healthScore, healthStatus } = req.body;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        healthScore: parseInt(healthScore),
        healthStatus
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'EQUIPMENT_HEALTH_UPDATED',
        entityType: 'Equipment',
        entityId: equipment.id,
        description: `Equipment "${equipment.name}" health updated to ${healthStatus} (${healthScore}%)`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Health status updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Update health status error:', error);
    res.status(500).json({ message: 'Failed to update health status' });
  }
};

/**
 * Scrap/Decommission equipment
 * @route PUT /api/equipment/:id/scrap
 */
export const scrapEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes, disposalMethod } = req.body;

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if already decommissioned
    if (existingEquipment.status === 'DECOMMISSIONED') {
      return res.status(400).json({ message: 'Equipment is already decommissioned' });
    }

    // Check for active maintenance requests
    const activeRequests = await prisma.maintenanceRequest.count({
      where: {
        equipmentId: id,
        status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD'] }
      }
    });

    if (activeRequests > 0) {
      return res.status(400).json({ 
        message: `Cannot scrap equipment with ${activeRequests} active maintenance request(s). Please complete or cancel them first.` 
      });
    }

    // Update equipment status
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        status: 'DECOMMISSIONED',
        healthScore: 0,
        healthStatus: 'CRITICAL',
        decommissionedAt: new Date(),
        decommissionedBy: req.user.id,
        decommissionReason: reason,
        decommissionNotes: notes,
        disposalMethod
      },
      include: {
        category: { select: { id: true, name: true } },
        workCenter: { select: { id: true, name: true, code: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'EQUIPMENT_SCRAPPED',
        entityType: 'Equipment',
        entityId: equipment.id,
        description: `Equipment "${equipment.name}" was decommissioned. Reason: ${reason || 'Not specified'}`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Equipment has been decommissioned successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Scrap equipment error:', error);
    res.status(500).json({ message: 'Failed to scrap equipment' });
  }
};

/**
 * Create maintenance request from equipment (Smart Button)
 * @route POST /api/equipment/:id/maintenance-request
 */
export const createMaintenanceFromEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, priority, description, title } = req.body;

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        workCenter: true
      }
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.status === 'DECOMMISSIONED') {
      return res.status(400).json({ message: 'Cannot create maintenance request for decommissioned equipment' });
    }

    // Generate request number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await prisma.maintenanceRequest.count();
    const requestNumber = `MR-${year}${month}-${String(count + 1).padStart(4, '0')}`;

    // Create maintenance request with equipment data pre-filled
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        requestNumber,
        title: title || `${type === 'PREVENTIVE' ? 'Preventive Maintenance' : 'Corrective Maintenance'} - ${equipment.name}`,
        description: description || `Maintenance request for ${equipment.name} (${equipment.code})`,
        type: type || 'CORRECTIVE',
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        equipmentId: id,
        workCenterId: equipment.workCenterId,
        requesterId: req.user.id,
        reportedDate: new Date()
      },
      include: {
        equipment: { select: { id: true, name: true, code: true } },
        workCenter: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'MAINTENANCE_CREATED_FROM_EQUIPMENT',
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest.id,
        description: `Maintenance request "${maintenanceRequest.requestNumber}" created from equipment "${equipment.name}"`,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: maintenanceRequest
    });
  } catch (error) {
    console.error('Create maintenance from equipment error:', error);
    res.status(500).json({ message: 'Failed to create maintenance request' });
  }
};
