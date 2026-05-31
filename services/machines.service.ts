import { api, ApiResponse } from './api';

export interface Machine {
  _id: string;
  name: string;
  type?: string;
  department?: string;
  description?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateMachinePayload = Omit<Machine, '_id' | 'isActive'>;
export type UpdateMachinePayload = Partial<Omit<Machine, '_id'>>;

export const machinesService = {
  /** GET /api/machines */
  getAll: (): Promise<ApiResponse<Machine[]>> =>
    api.get<Machine[]>('/machines'),

  /** GET /api/machines/:id */
  getById: (id: string): Promise<ApiResponse<Machine>> =>
    api.get<Machine>(`/machines/${id}`),

  /** POST /api/machines */
  create: (payload: CreateMachinePayload): Promise<ApiResponse<Machine>> =>
    api.post<Machine>('/machines', payload),

  /** PUT /api/machines/:id */
  update: (id: string, payload: UpdateMachinePayload): Promise<ApiResponse<Machine>> =>
    api.put<Machine>(`/machines/${id}`, payload),

  /** DELETE /api/machines/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/machines/${id}`),
};
