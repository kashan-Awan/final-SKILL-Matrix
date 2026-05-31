import { api, ApiResponse } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateUserPayload = Omit<User, '_id' | 'isActive'> & {
  password: string;
};

export type UpdateUserPayload = Partial<Omit<User, '_id'>>;

export const usersService = {
  /** GET /api/users  — optionally filter by role */
  getAll: (role?: 'admin' | 'manager' | 'employee'): Promise<ApiResponse<User[]>> => {
    const query = role ? `?role=${role}` : '';
    return api.get<User[]>(`/users${query}`);
  },

  /** GET /api/users/:id */
  getById: (id: string): Promise<ApiResponse<User>> =>
    api.get<User>(`/users/${id}`),

  /** POST /api/users */
  create: (payload: CreateUserPayload): Promise<ApiResponse<User>> =>
    api.post<User>('/users', payload),

  /** PUT /api/users/:id */
  update: (id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> =>
    api.put<User>(`/users/${id}`, payload),

  /** DELETE /api/users/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/users/${id}`),
};
