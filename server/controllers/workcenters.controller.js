import prisma from '../config/database.js';

// Get all work centers
export const getWorkCenters = async (req, res) => {
  try {
    const { search, departmentId, isActive } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const workCenters = await prisma.workCenter.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        teams: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            equipment: true,
            maintenanceRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add counts
    const workCentersWithCounts = workCenters.map(wc => ({
      ...wc,
      equipmentCount: wc._count.equipment,
      requestCount: wc._count.maintenanceRequests
    }));

    res.json({
      success: true,
      data: workCentersWithCounts
    });
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ message: 'Failed to fetch work centers' });
  }
};

// Get single work center by ID
export const getWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        teams: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        equipment: {
          take: 10,
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            healthStatus: true
          }
        },
        maintenanceRequests: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          },
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
        _count: {
          select: {
            equipment: true,
            maintenanceRequests: true
          }
        }
      }
    });

    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json({
      success: true,
      data: {
        ...workCenter,
        equipmentCount: workCenter._count.equipment,
        totalRequests: workCenter._count.maintenanceRequests
      }
    });
  } catch (error) {
    console.error('Get work center error:', error);
    res.status(500).json({ message: 'Failed to fetch work center' });
  }
};

// Create new work center
export const createWorkCenter = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      description, 
      location, 
      capacity, 
      departmentId, 
      teamIds,
      // New fields from design.json
      tag,
      costPerHour,
      capacityTimeEfficiency,
      oeeTarget,
      alternativeWorkCenterIds
    } = req.body;

    // Check if code already exists
    const existingCode = await prisma.workCenter.findUnique({
      where: { code }
    });

    if (existingCode) {
      return res.status(400).json({ message: 'A work center with this code already exists' });
    }

    // Create work center
    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        location,
        capacity: capacity ? parseInt(capacity) : null,
        departmentId,
        // New fields
        tag,
        costPerHour: costPerHour ? parseFloat(costPerHour) : null,
        capacityTimeEfficiency: capacityTimeEfficiency ? parseFloat(capacityTimeEfficiency) : null,
        oeeTarget: oeeTarget ? parseFloat(oeeTarget) : null,
        teams: teamIds?.length > 0 ? {
          connect: teamIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        teams: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add alternative work centers if provided
    if (alternativeWorkCenterIds?.length > 0) {
      await prisma.workCenterAlternative.createMany({
        data: alternativeWorkCenterIds.map((altId, index) => ({
          primaryWorkCenterId: workCenter.id,
          alternativeWorkCenterId: altId,
          priority: index + 1
        }))
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'WORK_CENTER_CREATED',
        entityType: 'WorkCenter',
        entityId: workCenter.id,
        description: `Work center "${workCenter.name}" (${workCenter.code}) was created`,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Work center created successfully',
      data: workCenter
    });
  } catch (error) {
    console.error('Create work center error:', error);
    res.status(500).json({ message: 'Failed to create work center' });
  }
};

// Update work center
export const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      code, 
      description, 
      location, 
      capacity, 
      departmentId, 
      isActive, 
      teamIds,
      // New fields from design.json
      tag,
      costPerHour,
      capacityTimeEfficiency,
      oeeTarget,
      alternativeWorkCenterIds
    } = req.body;

    // Check if work center exists
    const existingWorkCenter = await prisma.workCenter.findUnique({
      where: { id }
    });

    if (!existingWorkCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    // Check for duplicate code
    if (code && code !== existingWorkCenter.code) {
      const duplicateCode = await prisma.workCenter.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (duplicateCode) {
        return res.status(400).json({ message: 'A work center with this code already exists' });
      }
    }

    // Prepare teams update
    const teamsUpdate = {};
    if (teamIds !== undefined) {
      teamsUpdate.teams = {
        set: teamIds.map(teamId => ({ id: teamId }))
      };
    }

    // Update work center
    const workCenter = await prisma.workCenter.update({
      where: { id },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        description,
        location,
        capacity: capacity !== undefined ? (capacity ? parseInt(capacity) : null) : undefined,
        departmentId,
        isActive,
        // New fields
        tag,
        costPerHour: costPerHour !== undefined ? (costPerHour ? parseFloat(costPerHour) : null) : undefined,
        capacityTimeEfficiency: capacityTimeEfficiency !== undefined ? (capacityTimeEfficiency ? parseFloat(capacityTimeEfficiency) : null) : undefined,
        oeeTarget: oeeTarget !== undefined ? (oeeTarget ? parseFloat(oeeTarget) : null) : undefined,
        ...teamsUpdate
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        teams: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update alternative work centers if provided
    if (alternativeWorkCenterIds !== undefined) {
      // Remove existing alternatives
      await prisma.workCenterAlternative.deleteMany({
        where: { primaryWorkCenterId: id }
      });
      
      // Add new alternatives
      if (alternativeWorkCenterIds?.length > 0) {
        await prisma.workCenterAlternative.createMany({
          data: alternativeWorkCenterIds.map((altId, index) => ({
            primaryWorkCenterId: id,
            alternativeWorkCenterId: altId,
            priority: index + 1
          }))
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'WORK_CENTER_UPDATED',
        entityType: 'WorkCenter',
        entityId: workCenter.id,
        description: `Work center "${workCenter.name}" was updated`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Work center updated successfully',
      data: workCenter
    });
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ message: 'Failed to update work center' });
  }
};

// Delete work center
export const deleteWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if work center exists
    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            equipment: true,
            maintenanceRequests: true 
          }
        }
      }
    });

    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    // Check for related records
    if (workCenter._count.equipment > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete work center with associated equipment. Reassign equipment first.' 
      });
    }

    if (workCenter._count.maintenanceRequests > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete work center with maintenance requests. Complete or reassign requests first.' 
      });
    }

    // Disconnect teams first
    await prisma.workCenter.update({
      where: { id },
      data: {
        teams: { set: [] }
      }
    });

    // Delete work center
    await prisma.workCenter.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'WORK_CENTER_DELETED',
        entityType: 'WorkCenter',
        entityId: id,
        description: `Work center "${workCenter.name}" was deleted`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Work center deleted successfully'
    });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ message: 'Failed to delete work center' });
  }
};

// Get work center statistics
export const getWorkCenterStats = async (req, res) => {
  try {
    const { id } = req.params;

    const workCenter = await prisma.workCenter.findUnique({
      where: { id },
      include: {
        maintenanceRequests: {
          select: {
            status: true,
            priority: true,
            actualHours: true
          }
        },
        equipment: {
          select: {
            status: true,
            healthStatus: true
          }
        }
      }
    });

    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    // Calculate statistics
    const stats = {
      totalEquipment: workCenter.equipment.length,
      operationalEquipment: workCenter.equipment.filter(e => e.status === 'OPERATIONAL').length,
      criticalEquipment: workCenter.equipment.filter(e => e.healthStatus === 'CRITICAL').length,
      totalRequests: workCenter.maintenanceRequests.length,
      completedRequests: workCenter.maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
      pendingRequests: workCenter.maintenanceRequests.filter(r => 
        ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS'].includes(r.status)
      ).length,
      criticalRequests: workCenter.maintenanceRequests.filter(r => 
        r.priority === 'CRITICAL' && r.status !== 'COMPLETED'
      ).length,
      totalHoursWorked: workCenter.maintenanceRequests.reduce((sum, r) => sum + (r.actualHours || 0), 0)
    };

    // Equipment health breakdown
    stats.equipmentHealth = {
      healthy: workCenter.equipment.filter(e => e.healthStatus === 'HEALTHY').length,
      warning: workCenter.equipment.filter(e => e.healthStatus === 'WARNING').length,
      critical: workCenter.equipment.filter(e => e.healthStatus === 'CRITICAL').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get work center stats error:', error);
    res.status(500).json({ message: 'Failed to fetch work center statistics' });
  }
};

// Generate next work center code
export const generateCode = async (req, res) => {
  try {
    const { prefix = 'WC' } = req.query;

    // Find the highest existing code with this prefix
    const lastWorkCenter = await prisma.workCenter.findFirst({
      where: {
        code: {
          startsWith: prefix.toUpperCase()
        }
      },
      orderBy: { code: 'desc' }
    });

    let nextNumber = 1;
    if (lastWorkCenter) {
      const match = lastWorkCenter.code.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const nextCode = `${prefix.toUpperCase()}${String(nextNumber).padStart(3, '0')}`;

    res.json({
      success: true,
      data: { code: nextCode }
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: 'Failed to generate code' });
  }
};
