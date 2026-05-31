import { api, ApiResponse } from './api';

export interface Department {
  _id: string;
  id?: string;
  name: string;
  area: string;
  description?: string;
  headOfDepartment?: string;
  employeeCount?: number;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateDepartmentPayload = Omit<Department, '_id' | 'id' | 'isActive'>;
export type UpdateDepartmentPayload = Partial<Omit<Department, '_id' | 'id'>>;

export const departmentsService = {
  /** GET /api/departments */
  getAll: (): Promise<ApiResponse<Department[]>> =>
    api.get<Department[]>('/departments'),

  /** GET /api/departments/:id */
  getById: (id: string): Promise<ApiResponse<Department>> =>
    api.get<Department>(`/departments/${id}`),

  /** POST /api/departments */
  create: (payload: CreateDepartmentPayload): Promise<ApiResponse<Department>> =>
    api.post<Department>('/departments', payload),

  /** PUT /api/departments/:id */
  update: (id: string, payload: UpdateDepartmentPayload): Promise<ApiResponse<Department>> =>
    api.put<Department>(`/departments/${id}`, payload),

  /** DELETE /api/departments/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/departments/${id}`),
};
