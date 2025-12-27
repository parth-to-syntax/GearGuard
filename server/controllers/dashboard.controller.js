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

/**
 * Get Reports Data
 * @route GET /api/dashboard/reports
 * @query {string} startDate - Start date for report range
 * @query {string} endDate - End date for report range
 * @query {string} reportType - Type of report (overview, equipment, team, workCenter)
 * @query {string} workCenterId - Optional work center filter
 * @query {string} teamId - Optional team filter
 * @returns {Object} Report data based on type
 */
export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, reportType, workCenterId, teamId } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    
    const whereClause = {};
    if (Object.keys(dateFilter).length > 0) {
      whereClause.reportedDate = dateFilter;
    }
    if (workCenterId) whereClause.workCenterId = workCenterId;
    if (teamId) whereClause.teamId = teamId;

    // Get all requests for the period
    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        equipment: {
          select: { id: true, name: true, code: true }
        },
        assignedTo: {
          select: { id: true, name: true, teamId: true }
        },
        workCenter: {
          select: { id: true, name: true }
        },
        team: {
          select: { id: true, name: true }
        }
      }
    });

    // Calculate overview stats
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
    const pendingRequests = requests.filter(r => 
      ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(r.status)
    ).length;
    const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS').length;
    const overdueRequests = requests.filter(r => 
      r.dueDate && new Date(r.dueDate) < new Date() && 
      !['COMPLETED', 'CANCELLED'].includes(r.status)
    ).length;
    
    const preventiveCount = requests.filter(r => r.type === 'PREVENTIVE').length;
    const correctiveCount = requests.filter(r => 
      ['BREAKDOWN', 'CORRECTIVE'].includes(r.type)
    ).length;
    
    // Calculate average completion time
    const completedWithTime = requests.filter(r => 
      r.status === 'COMPLETED' && r.actualHours
    );
    const avgCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => sum + (r.actualHours || 0), 0) / completedWithTime.length
      : 0;
    
    const completionRate = totalRequests > 0 
      ? ((completedRequests / totalRequests) * 100).toFixed(1) 
      : 0;

    let reportData = {
      totalRequests,
      completedRequests,
      pendingRequests,
      inProgressRequests,
      avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1)),
      completionRate: parseFloat(completionRate),
      overdueRequests,
      preventiveCount,
      correctiveCount
    };

    // Add report-type specific data
    if (reportType === 'equipment') {
      // Group requests by equipment
      const equipmentStats = {};
      requests.forEach(r => {
        if (r.equipment) {
          const key = r.equipment.id;
          if (!equipmentStats[key]) {
            equipmentStats[key] = {
              name: r.equipment.name,
              requests: 0,
              downtime: 0
            };
          }
          equipmentStats[key].requests++;
          equipmentStats[key].downtime += r.actualHours || 0;
        }
      });
      
      reportData.topEquipmentByRequests = Object.values(equipmentStats)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10);
    }

    if (reportType === 'team') {
      // Group requests by team/technician
      const teamStats = {};
      requests.forEach(r => {
        if (r.team) {
          const key = r.team.id;
          if (!teamStats[key]) {
            teamStats[key] = {
              name: r.team.name,
              completed: 0,
              total: 0,
              totalTime: 0
            };
          }
          teamStats[key].total++;
          if (r.status === 'COMPLETED') {
            teamStats[key].completed++;
            teamStats[key].totalTime += r.actualHours || 0;
          }
        }
      });
      
      reportData.teamPerformance = Object.values(teamStats).map(t => ({
        name: t.name,
        completed: t.completed,
        avgTime: t.completed > 0 ? parseFloat((t.totalTime / t.completed).toFixed(1)) : 0,
        rating: t.total > 0 ? parseFloat(((t.completed / t.total) * 5).toFixed(1)) : 0
      }));
    }

    if (reportType === 'workCenter') {
      // Group requests by work center
      const wcStats = {};
      requests.forEach(r => {
        if (r.workCenter) {
          const key = r.workCenter.id;
          if (!wcStats[key]) {
            wcStats[key] = {
              name: r.workCenter.name,
              total: 0,
              completed: 0,
              pending: 0
            };
          }
          wcStats[key].total++;
          if (r.status === 'COMPLETED') wcStats[key].completed++;
          if (['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS'].includes(r.status)) {
            wcStats[key].pending++;
          }
        }
      });
      
      reportData.workCenterStats = Object.values(wcStats);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch report data' 
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
