import prisma from '../config/database.js';

/**
 * Get Dashboard KPIs
 * @route GET /api/dashboard/kpis
 * @returns {Object} KPI data for dashboard cards
 */
export const getKPIs = async (req, res) => {
  try {
    // Get critical equipment count (health score < 30)
    const criticalEquipment = await prisma.equipment.count({
      where: {
        healthScore: {
          lt: 30
        },
        status: {
          not: 'DECOMMISSIONED'
        }
      }
    });

    // Get total active equipment
    const totalEquipment = await prisma.equipment.count({
      where: {
        status: {
          not: 'DECOMMISSIONED'
        }
      }
    });

    // Get technician load (active technicians with assignments)
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        isActive: true
      },
      include: {
        requestsAssigned: {
          where: {
            status: {
              in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD']
            }
          }
        }
      }
    });

    const totalTechnicians = technicians.length;
    const busyTechnicians = technicians.filter(t => t.requestsAssigned.length > 0).length;
    const technicianLoad = totalTechnicians > 0 
      ? Math.round((busyTechnicians / totalTechnicians) * 100) 
      : 0;

    // Get open requests count
    const openRequests = await prisma.maintenanceRequest.count({
      where: {
        status: {
          in: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD']
        }
      }
    });

    // Get overdue requests (due date passed, not completed)
    const overdueRequests = await prisma.maintenanceRequest.count({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        },
        dueDate: {
          lt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        criticalEquipment: {
          count: criticalEquipment,
          total: totalEquipment,
          label: `${criticalEquipment} Units`,
          subtitle: '(Health < 30%)'
        },
        technicianLoad: {
          percentage: technicianLoad,
          busy: busyTechnicians,
          total: totalTechnicians,
          label: `${technicianLoad}% Utilized`,
          subtitle: technicianLoad > 80 ? '(Assign Carefully)' : '(Available Capacity)'
        },
        openRequests: {
          pending: openRequests,
          overdue: overdueRequests,
          label: `${openRequests} Pending`,
          subtitle: `${overdueRequests} Overdue`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard KPIs' 
    });
  }
};

/**
 * Get Recent Maintenance Requests
 * @route GET /api/dashboard/recent-requests
 * @query {number} limit - Number of requests to return (default: 10)
 * @returns {Array} Recent maintenance requests
 */
export const getRecentRequests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.maintenanceRequest.count();

    // Get recent maintenance requests
    const requests = await prisma.maintenanceRequest.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Transform data for frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      requestNumber: request.requestNumber,
      subject: request.title,
      technicianName: request.assignedTo?.name || 'Unassigned',
      technicianAvatar: request.assignedTo?.avatar,
      equipment: request.equipment ? `${request.equipment.name}/${request.equipment.code}` : '-',
      equipmentId: request.equipment?.id,
      workCenter: request.workCenter?.name || '-',
      company: request.createdBy?.company?.name || 'N/A',
      status: formatStatus(request.status),
      statusRaw: request.status,
      priority: request.priority,
      type: request.type,
      reportedDate: request.reportedDate,
      scheduledDate: request.scheduledDate,
      dueDate: request.dueDate,
      isOverdue: request.dueDate && new Date(request.dueDate) < new Date() && 
                 !['COMPLETED', 'CANCELLED'].includes(request.status)
    }));

    res.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recent requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent requests' 
    });
  }
};

/**
 * Get Dashboard Summary Stats
 * @route GET /api/dashboard/stats
 * @returns {Object} Summary statistics
 */
export const getStats = async (req, res) => {
  try {
    // Requests by status
    const requestsByStatus = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Requests by priority
    const requestsByPriority = await prisma.maintenanceRequest.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });

    // Requests by type
    const requestsByType = await prisma.maintenanceRequest.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    // Equipment by health status
    const equipmentByHealth = await prisma.equipment.groupBy({
      by: ['healthStatus'],
      _count: {
        healthStatus: true
      }
    });

    res.json({
      success: true,
      data: {
        requestsByStatus: requestsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        requestsByPriority: requestsByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {}),
        requestsByType: requestsByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        equipmentByHealth: equipmentByHealth.reduce((acc, item) => {
          acc[item.healthStatus] = item._count.healthStatus;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats' 
    });
  }
};

// Helper function to format status for display
function formatStatus(status) {
  const statusMap = {
    'DRAFT': 'Draft',
    'SUBMITTED': 'New Request',
    'IN_REVIEW': 'In Review',
    'APPROVED': 'Approved',
    'IN_PROGRESS': 'In Progress',
    'ON_HOLD': 'On Hold',
    'COMPLETED': 'Completed',
    'REOPENED': 'Reopened',
    'CANCELLED': 'Cancelled'
  };
  return statusMap[status] || status;
}
