import prisma from '../config/database.js';

// Get all teams
export const getTeams = async (req, res) => {
  try {
    const { search, workCenterId, isActive } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (workCenterId) {
      where.workCenterId = workCenterId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            maintenanceRequests: true,
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add leader info from members
    const teamsWithLeader = teams.map(team => {
      const leader = team.members.find(m => m.id === team.leaderId);
      return {
        ...team,
        leader: leader || null,
        memberCount: team._count.members,
        activeRequests: team._count.maintenanceRequests
      };
    });

    res.json({
      success: true,
      data: teamsWithLeader
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
};

// Get single team by ID
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
            phone: true,
            isActive: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
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
            reportedDate: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            maintenanceRequests: true,
            members: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find leader
    const leader = team.members.find(m => m.id === team.leaderId);

    res.json({
      success: true,
      data: {
        ...team,
        leader: leader || null,
        memberCount: team._count.members,
        totalRequests: team._count.maintenanceRequests
      }
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Failed to fetch team' });
  }
};

// Create new team
export const createTeam = async (req, res) => {
  try {
    const { name, description, leaderId, workCenterId, memberIds } = req.body;

    // Check if team name already exists
    const existingTeam = await prisma.team.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        leaderId,
        workCenterId,
        members: memberIds?.length > 0 ? {
          connect: memberIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_CREATED',
        entityType: 'Team',
        entityId: team.id,
        description: `Team "${team.name}" was created`,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Failed to create team' });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, leaderId, workCenterId, isActive, memberIds } = req.body;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check for duplicate name
    if (name && name !== existingTeam.name) {
      const duplicateName = await prisma.team.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicateName) {
        return res.status(400).json({ message: 'A team with this name already exists' });
      }
    }

    // Prepare member update
    const memberUpdate = {};
    if (memberIds !== undefined) {
      // Disconnect all current members and connect new ones
      memberUpdate.members = {
        set: memberIds.map(memberId => ({ id: memberId }))
      };
    }

    // Update team
    const team = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
        leaderId,
        workCenterId,
        isActive,
        ...memberUpdate
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_UPDATED',
        entityType: 'Team',
        entityId: team.id,
        description: `Team "${team.name}" was updated`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Failed to update team' });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: { maintenanceRequests: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team has active requests
    if (team._count.maintenanceRequests > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with active maintenance requests. Reassign or complete the requests first.' 
      });
    }

    // Disconnect all members first
    await prisma.team.update({
      where: { id },
      data: {
        members: { set: [] }
      }
    });

    // Delete team
    await prisma.team.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_DELETED',
        entityType: 'Team',
        entityId: id,
        description: `Team "${team.name}" was deleted`,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
};

// Add member to team
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add member
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        members: {
          connect: { id: userId }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Member added successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
};

// Remove member from team
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // If removing the leader, clear leader field
    const updateData = {
      members: {
        disconnect: { id: userId }
      }
    };

    if (team.leaderId === userId) {
      updateData.leaderId = null;
    }

    // Remove member
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

// Get available users (not in any team or technicians)
export const getAvailableUsers = async (req, res) => {
  try {
    const { teamId } = req.query;

    // Get users who are technicians or managers
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: ['TECHNICIAN', 'MANAGER']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        department: true,
        teamId: true
      },
      orderBy: { name: 'asc' }
    });

    // Mark users who are in other teams
    const usersWithTeamInfo = users.map(user => ({
      ...user,
      isInOtherTeam: user.teamId && user.teamId !== teamId,
      isAvailable: !user.teamId || user.teamId === teamId
    }));

    res.json({
      success: true,
      data: usersWithTeamInfo
    });
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({ message: 'Failed to fetch available users' });
  }
};

// Get team statistics
export const getTeamStats = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        maintenanceRequests: {
          select: {
            status: true,
            priority: true,
            actualHours: true,
            completedDate: true,
            reportedDate: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            requestsAssigned: {
              where: {
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
              },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Calculate statistics
    const stats = {
      totalRequests: team.maintenanceRequests.length,
      completedRequests: team.maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
      inProgressRequests: team.maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
      pendingRequests: team.maintenanceRequests.filter(r => ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(r.status)).length,
      criticalRequests: team.maintenanceRequests.filter(r => r.priority === 'CRITICAL' && r.status !== 'COMPLETED').length,
      totalHoursWorked: team.maintenanceRequests.reduce((sum, r) => sum + (r.actualHours || 0), 0),
      memberWorkload: team.members.map(m => ({
        id: m.id,
        name: m.name,
        activeRequests: m.requestsAssigned.length
      }))
    };

    // Completion rate
    stats.completionRate = stats.totalRequests > 0 
      ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
      : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ message: 'Failed to fetch team statistics' });
  }
};
