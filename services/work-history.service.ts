import { api, ApiResponse } from './api';

export interface WorkHistory {
  _id: string;
  employeeId: string;
  machineId?: string;
  department?: string;
  role?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateWorkHistoryPayload = Omit<WorkHistory, '_id' | 'isActive'>;
export type UpdateWorkHistoryPayload = Partial<Omit<WorkHistory, '_id'>>;

export const workHistoryService = {
  /** GET /api/work-history */
  getAll: (): Promise<ApiResponse<WorkHistory[]>> =>
    api.get<WorkHistory[]>('/work-history'),

  /** GET /api/work-history/employee/:employeeId */
  getByEmployee: (employeeId: string): Promise<ApiResponse<WorkHistory[]>> =>
    api.get<WorkHistory[]>(`/work-history/employee/${employeeId}`),

  /** GET /api/work-history/:id */
  getById: (id: string): Promise<ApiResponse<WorkHistory>> =>
    api.get<WorkHistory>(`/work-history/${id}`),

  /** POST /api/work-history */
  create: (payload: CreateWorkHistoryPayload): Promise<ApiResponse<WorkHistory>> =>
    api.post<WorkHistory>('/work-history', payload),

  /** PUT /api/work-history/:id */
  update: (id: string, payload: UpdateWorkHistoryPayload): Promise<ApiResponse<WorkHistory>> =>
    api.put<WorkHistory>(`/work-history/${id}`, payload),

  /** DELETE /api/work-history/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/work-history/${id}`),
};
