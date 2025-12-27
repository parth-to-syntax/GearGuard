import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

// Role-based permissions matching backend
const permissions = {
  ADMIN: {
    canViewAll: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canManageTeams: true,
    canApprove: true,
    canAssign: true,
    canViewReports: true,
  },
  MANAGER: {
    canViewAll: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageTeams: true,
    canApprove: true,
    canAssign: true,
    canViewReports: true,
  },
  TECHNICIAN: {
    canViewAll: false,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageTeams: false,
    canApprove: false,
    canAssign: false,
    canViewReports: false,
  },
  REQUESTER: {
    canViewAll: false,
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageTeams: false,
    canApprove: false,
    canAssign: false,
    canViewReports: false,
  },
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage immediately to prevent flash
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token validity on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && user) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/signup', userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Signup failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Memoized user permissions
  const userPermissions = useMemo(() => {
    return user?.role ? permissions[user.role] : permissions.REQUESTER;
  }, [user?.role]);

  // Helper to check specific permission
  const hasPermission = (permission) => {
    return userPermissions[permission] || false;
  };

  // Helper to check role
  const hasRole = (...roles) => {
    return user?.role && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    permissions: userPermissions,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
