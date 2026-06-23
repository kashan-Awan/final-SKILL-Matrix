import { api, ApiResponse } from './api';

export interface SkillMatrix {
  _id: string;
  employeeId: string;
  departmentId: string;
  name: string;
  description?: string;
  matrixData?: any;
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type CreateSkillMatrixPayload = Omit<SkillMatrix, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>;
export type UpdateSkillMatrixPayload = Partial<Omit<SkillMatrix, '_id'>>;

export const skillMatrixService = {
  /** GET /api/skill-matrix */
  getAll: (): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>('/skill-matrix'),

  /** GET /api/skill-matrix?employeeId=:id */
  getByEmployee: (employeeId: string): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>(`/skill-matrix?employeeId=${employeeId}`),

  /** GET /api/skill-matrix?departmentId=:id */
  getByDepartment: (departmentId: string): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>(`/skill-matrix?departmentId=${departmentId}`),

  /** GET /api/skill-matrix?matrixId=:id */
  getById: (id: string): Promise<ApiResponse<SkillMatrix>> =>
    api.get<SkillMatrix>(`/skill-matrix?matrixId=${id}`),

  /** POST /api/skill-matrix */
  create: (payload: CreateSkillMatrixPayload): Promise<ApiResponse<SkillMatrix>> =>
    api.post<SkillMatrix>('/skill-matrix', payload),

  /** PUT /api/skill-matrix/:id */
  update: (id: string, payload: UpdateSkillMatrixPayload): Promise<ApiResponse<SkillMatrix>> =>
    api.put<SkillMatrix>(`/skill-matrix/${id}`, payload),

  /** DELETE /api/skill-matrix/:id */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/skill-matrix/${id}`),
};