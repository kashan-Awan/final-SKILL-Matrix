import { api, ApiResponse } from './api';

export interface ExportLog {
  _id: string;
  status: 'pending' | 'completed' | 'failed';
  recordCount?: number;
  errorMessage?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateExportLogPayload = Omit<ExportLog, '_id' | 'isActive'>;

export interface UpdateExportLogStatusPayload {
  status: 'pending' | 'completed' | 'failed';
  recordCount?: number;
  errorMessage?: string;
}

export const exportLogsService = {
  /** GET /api/export-logs */
  getAll: (): Promise<ApiResponse<ExportLog[]>> =>
    api.get<ExportLog[]>('/export-logs'),

  /** GET /api/export-logs/:id */
  getById: (id: string): Promise<ApiResponse<ExportLog>> =>
    api.get<ExportLog>(`/export-logs/${id}`),

  /** POST /api/export-logs */
  create: (payload: CreateExportLogPayload): Promise<ApiResponse<ExportLog>> =>
    api.post<ExportLog>('/export-logs', payload),

  /** PATCH /api/export-logs/:id/status */
  updateStatus: (
    id: string,
    payload: UpdateExportLogStatusPayload
  ): Promise<ApiResponse<ExportLog>> =>
    api.patch<ExportLog>(`/export-logs/${id}/status`, payload),

  /** DELETE /api/export-logs/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/export-logs/${id}`),
};
