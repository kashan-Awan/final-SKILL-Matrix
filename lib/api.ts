import { mapRoleToDb, mapRoleFromDb } from './backendClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to get token
const getToken = () => {
  if (typeof window === 'undefined') return null;
  // Prioritize the admin token if we are on an admin route, otherwise use the standard token.
  
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');

  // If we're in the admin section, definitely prefer the admin token.
  if (window.location.pathname.startsWith('/admin')) {
    return adminToken || userToken;
  }
  // Otherwise, use whichever is available, preferring the standard user token.
  return userToken || adminToken;
};

// Generic request function with authentication
const request = async (endpoint: string, options: RequestInit = {}) => {
  // Don't send Authorization header for login/register to avoid middleware conflicts with stale tokens
  const isAuthRoute = endpoint === '/auth/login' || endpoint === '/auth/register';
  const token = isAuthRoute ? null : getToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  let data;
  // Handle 204 No Content as a successful result
  if (response.status === 204) {
    return { success: true };
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { success: false, message: text || 'Server returned a non-JSON response' };
  }

  // Automatically save token if this was a successful login
  if (typeof window !== 'undefined' && response.ok && endpoint === '/auth/login') {
    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user;
    if (token) {
      // Normalize role from DB format (e.g., 'employee' -> 'user') before checking
      const normalizedRole = user?.role ? mapRoleFromDb(user.role) : '';
      const tokenKey = normalizedRole === 'admin' ? 'adminToken' : 'token';
      localStorage.setItem(tokenKey, token);
    }
  }
  
  if (!response.ok) {
    // If unauthorized and not on a login/register route, clear tokens and redirect
    if (response.status === 401 && !isAuthRoute) {
      console.warn('[API] Token expired or invalid, logging out...');
      api.auth.logout();
    }
    console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, data.message || 'Unknown error');
  } else {
    if (endpoint === '/auth/login') console.log('[API SUCCESS] Login successful, token stored');
  }

  // If the backend now returns a standardized { success, data, message }
  // we return the whole object so the UI can check for 'success'
  return data;
};

export const api = {
  // Generic methods
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  
  post: (endpoint: string, body?: any) => request(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  
  put: (endpoint: string, body: any) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  
  delete: (endpoint: string, body?: any) => request(endpoint, { 
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined 
  }),

  patch: (endpoint: string, body: any) => request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  
  // Auth endpoints
  auth: {
    login: (data: any) => {
      if (data.role) data.role = mapRoleToDb(data.role);
      return api.post('/auth/login', data);
    },
    register: (data: any) => {
      if (data.role) data.role = mapRoleToDb(data.role);
      return api.post('/auth/register', data);
    },
    forgotPassword: (email: string, role: string) => 
      api.post('/auth/forgot-password', { email, role: mapRoleToDb(role) }),
    resetPassword: (token: string, newPassword: string, role: string) => 
      api.patch('/auth/reset-password', { token, newPassword, role: mapRoleToDb(role) }),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
  },
  
  // Password request endpoints
  passwordRequest: {
    submit: (userId: string, desiredPassword: string) => api.post('/admin/password-requests', { userId, desiredPassword }),
  },
  
  // Registration approvals (admin only)
  registrationApprovals: {
    getAll: (status: string) => api.get(`/auth/registrations?status=${status}`),
    approve: (requestId: string) => api.post(`/auth/registrations/${requestId}/approve`),
    reject: (requestId: string, reason?: string) => api.post(`/auth/registrations/${requestId}/reject`, { rejectionReason: reason }),
    getStats: () => api.get('/auth/registrations/stats'),
  },
};