import prisma from '../config/database.js';

// Generate unique request number
const generateRequestNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of requests this month
  const count = await prisma.maintenanceRequest.count({
    where: {
      createdAt: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1)
      }
    }
  });
  
  return `MR/${year}/${month}/${String(count + 1).padStart(4, '0')}`;
};

// Helper to build role-based where clause
const buildRoleFilter = (req, baseWhere = {}) => {
  const { roleFilter } = req;
  const where = { ...baseWhere };

  if (!roleFilter) return where;

  // Admins and Managers see all
  if (roleFilter.canViewAll) {
    return where;
  }

  // Technicians see only assigned requests
  if (roleFilter.canViewAssigned) {
    where.OR = [
      { assignedToId: roleFilter.userId },
      { team: { members: { some: { id: roleFilter.userId } } } }
    ];
    return where;
  }

  // Requesters see only their own requests
  if (roleFilter.canViewOwn) {
    where.createdById = roleFilter.userId;
    return where;
  }

  return where;
};

/**
 * Get all maintenance requests with filters
 * @route GET /api/maintenance-requests
 */
export const getMaintenanceRequests = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      type, 
      technician, 
      team,
      equipment,
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause with role-based filtering
    let where = buildRoleFilter(req, {});
    
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (type) {
      where.type = type;
    }
    if (technician) {
      where.assignedToId = technician;
    }
    if (team) {
      where.teamId = team;
    }
    if (equipment) {
      where.equipmentId = equipment;
    }
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { requestNumber: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Get total count
    const total = await prisma.maintenanceRequest.count({ where });

    // Get requests with relations
    const requests = await prisma.maintenanceRequest.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            category: { select: { name: true } }
          }
        },
        assignedTo: {
          select: { id: true, name: true, avatar: true }
        },
        createdBy: {
          select: { 
            id: true, 
            name: true, 
            company: { select: { name: true } } 
          }
        },
        team: {
          select: { id: true, name: true }
        },
        workCenter: {
          select: { id: true, name: true }
        }
      }
    });

    // Transform for frontend
    const formattedRequests = requests.map(req => ({
      id: req.id,
      requestNumber: req.requestNumber,
      title: req.title,
      description: req.description,
      type: req.type,
      priority: req.priority,
      status: req.status,
      equipment: req.equipment,
      assignedTo: req.assignedTo,
      createdBy: req.createdBy,
      team: req.team,
      workCenter: req.workCenter,
      reportedDate: req.reportedDate,
      scheduledDate: req.scheduledDate,
      dueDate: req.dueDate,
      estimatedHours: req.estimatedHours,
      actualHours: req.actualHours,
      isOverdue: req.dueDate && new Date(req.dueDate) < new Date() && 
                 !['COMPLETED', 'CANCELLED'].includes(req.status)
    }));

    res.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch maintenance requests' 
    });
  }
};

/**
 * Get single maintenance request by ID
 * @route GET /api/maintenance-requests/:id
 */
export const getMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            category: true,
            company: true
          }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true, phone: true }
        },
        createdBy: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            company: { select: { id: true, name: true } } 
          }
        },
        team: {
          include: {
            members: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        workCenter: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found' 
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch maintenance request' 
    });
  }
};

/**
 * Create new maintenance request
 * @route POST /api/maintenance-requests
 */
export const createMaintenanceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      type = 'BREAKDOWN',
      priority = 'MEDIUM',
      equipmentId,
      workCenterId,
      teamId,
      assignedToId,
      scheduledDate,
      dueDate,
      estimatedHours,
      notes,
      instructions
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject/Title is required' 
      });
    }
    if (!equipmentId && !workCenterId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either Equipment or Work Center must be selected' 
      });
    }

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // If equipment is selected, auto-fill team from equipment
    let autoTeamId = teamId;
    let autoTechnicianId = assignedToId;
    
    if (equipmentId && !teamId) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        include: { 
          category: true,
          workCenter: {
            include: { teams: true }
          }
        }
      });
      
      if (equipment?.workCenter?.teams?.[0]) {
        autoTeamId = equipment.workCenter.teams[0].id;
      }
    }

    // Create the request
    const request = await prisma.maintenanceRequest.create({
      data: {
        requestNumber,
        title,
        description: description || '',
        type,
        priority,
        status: 'SUBMITTED',
        equipmentId,
        workCenterId,
        teamId: autoTeamId,
        assignedToId: autoTechnicianId,
        createdById: req.user.id,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        attachments: notes || instructions ? { notes, instructions } : null
      },
      include: {
        equipment: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'MaintenanceRequest',
        entityId: request.id,
        description: `Created maintenance request: ${title}`,
        user: { connect: { id: req.user.id } },
        maintenanceRequest: { connect: { id: request.id } }
      }
    });

    res.status(201).json({
      success: true,
      data: request,
      message: 'Maintenance request created successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create maintenance request' 
    });
  }
};

/**
 * Update maintenance request
 * @route PUT /api/maintenance-requests/:id
 */
export const updateMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if request exists
    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found' 
      });
    }

    // Process dates
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.completedDate) {
      updateData.completedDate = new Date(updateData.completedDate);
    }

    // Update the request
    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        equipment: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'MaintenanceRequest',
        entityId: request.id,
        description: `Updated maintenance request: ${request.title}`,
        user: { connect: { id: req.user.id } },
        maintenanceRequest: { connect: { id: request.id } }
      }
    });

    res.json({
      success: true,
      data: request,
      message: 'Maintenance request updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update maintenance request' 
    });
  }
};

/**
 * Update maintenance request status
 * @route PATCH /api/maintenance-requests/:id/status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualHours, resolution, rootCause } = req.body;

    // Validate status
    const validStatuses = [
      'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 
      'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'REOPENED', 'CANCELLED'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Build update data
    const updateData = { status };
    
    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !await prisma.maintenanceRequest.findUnique({ where: { id }, select: { startDate: true } }).then(r => r?.startDate)) {
      updateData.startDate = new Date();
    }
    if (status === 'COMPLETED') {
      updateData.completedDate = new Date();
      if (actualHours) updateData.actualHours = parseFloat(actualHours);
      if (resolution) updateData.resolution = resolution;
      if (rootCause) updateData.rootCause = rootCause;
    }

    // Check for SCRAP status - update equipment
    if (status === 'CANCELLED') {
      const request = await prisma.maintenanceRequest.findUnique({
        where: { id },
        select: { equipmentId: true }
      });
      
      if (request?.equipmentId) {
        await prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { 
            status: 'DECOMMISSIONED',
            healthStatus: 'CRITICAL',
            healthScore: 0
          }
        });
      }
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        equipment: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'STATUS_CHANGE',
        entityType: 'MaintenanceRequest',
        entityId: id,
        description: `Status changed to ${status}`,
        user: { connect: { id: req.user.id } },
        maintenanceRequest: { connect: { id: id } },
        oldValue: { status: updated.status },
        newValue: { status: status }
      }
    });

    res.json({
      success: true,
      data: updated,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
};

/**
 * Delete maintenance request
 * @route DELETE /api/maintenance-requests/:id
 */
export const deleteMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found' 
      });
    }

    // Delete related records first
    await prisma.comment.deleteMany({ where: { maintenanceRequestId: id } });
    await prisma.activityLog.deleteMany({ where: { maintenanceRequestId: id } });
    await prisma.workOrder.deleteMany({ where: { maintenanceRequestId: id } });

    // Delete the request
    await prisma.maintenanceRequest.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete maintenance request' 
    });
  }
};

/**
 * Add comment to maintenance request
 * @route POST /api/maintenance-requests/:id/comments
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: req.user.id,
        maintenanceRequestId: id
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add comment' 
    });
  }
};

/**
 * Get requests grouped by status (for Kanban)
 * @route GET /api/maintenance-requests/kanban
 */
export const getKanbanData = async (req, res) => {
  try {
    const { teamId, technicianId, workCenterId, priority, type } = req.query;

    // Build role-based filter
    let where = buildRoleFilter(req, {});
    
    if (teamId) where.teamId = teamId;
    if (technicianId) where.assignedToId = technicianId;
    if (workCenterId) where.workCenterId = workCenterId;
    if (priority) where.priority = priority;
    if (type) where.type = type;

    // Define status groups matching frontend statusColumns
    const statusGroups = {
      PENDING: ['PENDING', 'DRAFT', 'SUBMITTED'],
      APPROVED: ['APPROVED', 'IN_REVIEW'],
      IN_PROGRESS: ['IN_PROGRESS'],
      ON_HOLD: ['ON_HOLD', 'REOPENED'],
      COMPLETED: ['COMPLETED'],
      CANCELLED: ['CANCELLED']
    };

    // Fetch all requests and group by status
    const requests = await prisma.maintenanceRequest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        equipment: { select: { id: true, name: true, code: true } },
        workCenter: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        team: { select: { id: true, name: true } }
      }
    });

    // Group requests by status
    const kanbanData = {};
    Object.keys(statusGroups).forEach(groupKey => {
      kanbanData[groupKey] = [];
    });

    requests.forEach(req => {
      // Find which group this status belongs to
      for (const [groupKey, statuses] of Object.entries(statusGroups)) {
        if (statuses.includes(req.status)) {
          kanbanData[groupKey].push({
            id: req.id,
            requestNumber: req.requestNumber,
            title: req.title,
            priority: req.priority,
            status: req.status,
            type: req.type,
            equipment: req.equipment,
            workCenter: req.workCenter,
            assignedTo: req.assignedTo,
            team: req.team,
            scheduledDate: req.scheduledDate,
            dueDate: req.dueDate,
            isOverdue: req.dueDate && new Date(req.dueDate) < new Date() && 
                       !['COMPLETED', 'CANCELLED'].includes(req.status)
          });
          break;
        }
      }
    });

    res.json({
      success: true,
      data: kanbanData
    });
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch kanban data' 
    });
  }
};

/**
 * Get requests for calendar view
 * @route GET /api/maintenance-requests/calendar
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, type, workCenterId } = req.query;

    // Build role-based filter
    let where = buildRoleFilter(req, {});

    // Date range filter - requests with scheduledDate or dueDate in range
    if (startDate && endDate) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            {
              scheduledDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              dueDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              reportedDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            }
          ]
        }
      ];
    }

    // Filter by type (preventive/corrective)
    if (type) {
      where.type = type;
    }

    // Filter by work center
    if (workCenterId) {
      where.workCenterId = workCenterId;
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        equipment: { select: { id: true, name: true, code: true } },
        workCenter: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        team: { select: { id: true, name: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    // Transform to calendar events
    const events = requests.map(req => {
      const isOverdue = req.dueDate && new Date(req.dueDate) < new Date() && 
                        !['COMPLETED', 'CANCELLED'].includes(req.status);
      
      // Determine color based on status
      let color = '#3b82f6'; // blue - default/scheduled
      if (req.status === 'COMPLETED') color = '#22c55e'; // green
      else if (isOverdue) color = '#ef4444'; // red - overdue
      else if (req.priority === 'CRITICAL') color = '#f97316'; // orange
      else if (req.priority === 'HIGH') color = '#eab308'; // yellow

      return {
        id: req.id,
        title: req.title,
        start: req.scheduledDate || req.reportedDate,
        end: req.scheduledDate ? new Date(new Date(req.scheduledDate).getTime() + (req.estimatedHours || 1) * 60 * 60 * 1000) : null,
        allDay: !req.scheduledDate,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          requestNumber: req.requestNumber,
          status: req.status,
          priority: req.priority,
          type: req.type,
          equipment: req.equipment,
          workCenter: req.workCenter,
          assignedTo: req.assignedTo,
          team: req.team,
          isOverdue,
          dueDate: req.dueDate,
          estimatedHours: req.estimatedHours
        }
      };
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch calendar events' 
    });
  }
};
