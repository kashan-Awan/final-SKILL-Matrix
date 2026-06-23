import { api, ApiResponse } from './api';

export interface EmployeeData {
  id: string;
  _id?: string;
  name: string;
  displayId?: string;
  employeeId?: string;
  gender: string;
  departmentId: string | number;
  department?: string;
  skills?: Record<string, string>;
  totalSkills?: number;
  skillLevel?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface CreateEmployeePayload {
  name: string;
  displayId?: string;
  gender: string;
  departmentId: string;
  skills?: Array<{ name: string; level: string }>;
}

export type UpdateEmployeePayload = Partial<Omit<EmployeeData, 'id' | '_id'>>;

export const employeesService = {
  /** GET /api/employees - returns all employees with skills map + skillLevel */
  getAll: (): Promise<ApiResponse<EmployeeData[]>> =>
    api.get<EmployeeData[]>('/employees'),

  /** GET /api/employees?id=:id */
  getById: (id: string): Promise<ApiResponse<EmployeeData[]>> =>
    api.get<EmployeeData[]>(`/employees?id=${encodeURIComponent(id)}`),

  /** POST /api/employees */
  create: (payload: CreateEmployeePayload): Promise<ApiResponse<EmployeeData>> =>
    api.post<EmployeeData>('/employees', payload),

  /** PUT /api/employees/:id */
  update: (id: string, payload: UpdateEmployeePayload): Promise<ApiResponse<EmployeeData>> =>
    api.put<EmployeeData>(`/employees/${id}`, payload),

  /** DELETE /api/employees/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/employees/${id}`),
};
