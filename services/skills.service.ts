import { api, ApiResponse } from './api';

export interface Skill {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateSkillPayload = Omit<Skill, '_id' | 'isActive'>;
export type UpdateSkillPayload = Partial<Omit<Skill, '_id'>>;

export const skillsService = {
  /** GET /api/skills */
  getAll: (): Promise<ApiResponse<Skill[]>> =>
    api.get<Skill[]>('/skills'),

  /** GET /api/skills/:id */
  getById: (id: string): Promise<ApiResponse<Skill>> =>
    api.get<Skill>(`/skills/${id}`),

  /** POST /api/skills */
  create: (payload: CreateSkillPayload): Promise<ApiResponse<Skill>> =>
    api.post<Skill>('/skills', payload),

  /** PUT /api/skills/:id */
  update: (id: string, payload: UpdateSkillPayload): Promise<ApiResponse<Skill>> =>
    api.put<Skill>(`/skills/${id}`, payload),

  /** DELETE /api/skills/:id  (soft delete) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/skills/${id}`),
};
