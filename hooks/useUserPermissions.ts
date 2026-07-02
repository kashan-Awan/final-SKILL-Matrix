import { useState, useEffect } from 'react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: 'admin' | 'manager' | 'user' | 'employee';
  department?: string;
  loginTime: string;
}

// ✅ ADDED: Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('adminToken');
};

export const useUserPermissions = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = async (session: UserSession) => {
    try {
      // ✅ ADDED: Get the token
      const token = getToken();
      
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ ADDED: Authorization header
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: session.id,  // Changed from 'id' to 'userId' to match backend
          email: session.email,
          role: session.role,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.warn('Session validation failed:', data.message);
        localStorage.removeItem('userSession');
        setUserSession(null);
        return false;
      }

      const updatedSession = {
        ...session,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role ? data.user.role.toLowerCase() : session.role,
        department: data.user.department || session.department,
      };

      localStorage.setItem('userSession', JSON.stringify(updatedSession));
      setUserSession(updatedSession);
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      setUserSession(session);
      return true;
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      const session = localStorage.getItem('userSession');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          await validateSession(parsedSession);
        } catch (error) {
          console.error('Error parsing user session:', error);
          localStorage.removeItem('userSession');
          setUserSession(null);
        }
      } else {
        setUserSession(null);
      }
      setIsLoading(false);
    };

    initializeSession();

    // Listen to storage changes and custom session-update events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSession' || e.key === null) {
        initializeSession();
      }
    };

    const handleCustomUpdate = () => {
      initializeSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('session-update', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-update', handleCustomUpdate);
    };
  }, []);

  const isManager = userSession?.role?.toLowerCase() === 'manager';
  const isAdmin = userSession?.role?.toLowerCase() === 'admin';

  const permissions = {
    canAddEmployee: isManager || isAdmin,
    canEditEmployee: isManager || isAdmin,
    canDeleteEmployee: isManager || isAdmin,

    canAddSkill: isManager || isAdmin,
    canEditSkill: isManager || isAdmin,
    canDeleteSkill: isManager || isAdmin,

    canCreateSkillsMatrix: isManager || isAdmin,
    canEditSkillsMatrix: isManager || isAdmin,
    canDeleteSkillsMatrix: isManager || isAdmin,

    canEditSkillLevels: isManager || isAdmin,

    canResetPassword: isAdmin,
    canManageUsers: isAdmin,

    canViewDashboard: true,
    canViewEmployees: true,
    canViewSkillsMatrix: true,
  };

  const logout = () => {
    localStorage.removeItem('userSession');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUserSession(null);
    window.location.href = '/login';
  };

  return {
    userSession,
    permissions,
    isLoading,
    logout,
    isLoggedIn: !!userSession,
    userRole: userSession?.role || 'user',
    userEmail: userSession?.email || '',
    userName: userSession?.name || '',
    userEmployeeId: userSession?.employeeId || '',
    userDepartment: userSession?.department || '',
  };
};

export default useUserPermissions;