import { api, ApiResponse } from './api';

export interface SkillMatrix {
  _id: string;
  employeeId: string;
  departmentId: string;
  skillId: string;
  level: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateSkillMatrixPayload = Omit<SkillMatrix, '_id' | 'isActive'>;
export type UpdateSkillMatrixPayload = Partial<Omit<SkillMatrix, '_id'>>;

export const skillMatrixService = {
  /** GET /api/skill-matrices */
  getAll: (): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>('/skill-matrices'),

  /** GET /api/skill-matrices?departmentId=:id */
  getByEmployee: (employeeId: string): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>(`/skill-matrices?employeeId=${employeeId}`),

  /** GET /api/skill-matrices?departmentId=:id */
  getByDepartment: (departmentId: string): Promise<ApiResponse<SkillMatrix[]>> =>
    api.get<SkillMatrix[]>(`/skill-matrices?departmentId=${departmentId}`),

  /** GET /api/skill-matrices?matrixId=:id */
  getById: (id: string): Promise<ApiResponse<SkillMatrix>> =>
    api.get<SkillMatrix>(`/skill-matrices?matrixId=${id}`),

  /** POST /api/skill-matrices */
  create: (payload: CreateSkillMatrixPayload): Promise<ApiResponse<SkillMatrix>> =>
    api.post<SkillMatrix>('/skill-matrices', payload),

  /** PUT /api/skill-matrices */
  update: (id: string, payload: UpdateSkillMatrixPayload): Promise<ApiResponse<SkillMatrix>> =>
    api.put<SkillMatrix>('/skill-matrices', { id, ...payload }),

  /** DELETE /api/skill-matrices?id=:id */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/skill-matrices?id=${id}`),
};
