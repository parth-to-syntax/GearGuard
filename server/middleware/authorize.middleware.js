// Role-based authorization middleware

// Permission definitions by role
const permissions = {
  ADMIN: {
    canView: ['all'],
    canCreate: ['all'],
    canEdit: ['all'],
    canDelete: ['all']
  },
  MANAGER: {
    canView: ['maintenance_requests', 'equipment', 'work_centers', 'teams', 'reports', 'categories'],
    canCreate: ['maintenance_requests', 'equipment', 'work_centers', 'teams', 'categories'],
    canEdit: ['maintenance_requests', 'equipment', 'work_centers', 'teams', 'categories'],
    canDelete: ['maintenance_requests']
  },
  TECHNICIAN: {
    canView: ['assigned_requests', 'equipment', 'work_centers'],
    canCreate: ['maintenance_requests'],
    canEdit: ['assigned_requests', 'equipment_status'],
    canDelete: []
  },
  REQUESTER: {
    canView: ['own_requests'],
    canCreate: ['maintenance_requests'],
    canEdit: ['own_requests'],
    canDelete: []
  }
};

// Check if role has permission for action on resource
export const hasPermission = (role, action, resource) => {
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const actionPermissions = rolePermissions[action];
  if (!actionPermissions) return false;

  return actionPermissions.includes('all') || actionPermissions.includes(resource);
};

// Middleware to authorize based on roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;

    // Admin can do everything
    if (userRole === 'ADMIN') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Middleware to check specific permission
export const checkPermission = (action, resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (!hasPermission(userRole, action, resource)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Middleware to filter data based on role
export const filterByRole = (req, res, next) => {
  const userRole = req.user?.role;
  
  // Set filter flags on request for use in controllers
  req.roleFilter = {
    isAdmin: userRole === 'ADMIN',
    isManager: userRole === 'MANAGER',
    isTechnician: userRole === 'TECHNICIAN',
    isRequester: userRole === 'REQUESTER',
    userId: req.user?.id,
    // For technicians - get their team IDs
    canViewAll: userRole === 'ADMIN' || userRole === 'MANAGER',
    canViewAssigned: userRole === 'TECHNICIAN',
    canViewOwn: userRole === 'REQUESTER'
  };

  next();
};

export default { authorize, checkPermission, filterByRole, hasPermission, permissions };
