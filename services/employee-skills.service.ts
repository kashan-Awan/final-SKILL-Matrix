import { api, ApiResponse } from './api';

export interface EmployeeSkill {
  _id: string;
  employeeId: string;
  skillId: string;
  level: string;
  isActive: boolean;
  [key: string]: unknown;
}

export type CreateEmployeeSkillPayload = Omit<EmployeeSkill, '_id' | 'isActive'>;
export type UpdateEmployeeSkillPayload = Partial<Omit<EmployeeSkill, '_id'>>;

export const employeeSkillsService = {
  /** GET /api/employee-skills */
  getAll: (): Promise<ApiResponse<EmployeeSkill[]>> =>
    api.get<EmployeeSkill[]>('/employee-skills'),

  /** GET /api/employee-skills/employee/:employeeId */
  getByEmployee: (employeeId: string): Promise<ApiResponse<EmployeeSkill[]>> =>
    api.get<EmployeeSkill[]>(`/employee-skills/employee/${employeeId}`),

  /** POST /api/employee-skills */
  create: (payload: CreateEmployeeSkillPayload): Promise<ApiResponse<EmployeeSkill>> =>
    api.post<EmployeeSkill>('/employee-skills', payload),

  /** PUT /api/employee-skills/:id */
  update: (id: string, payload: UpdateEmployeeSkillPayload): Promise<ApiResponse<EmployeeSkill>> =>
    api.put<EmployeeSkill>(`/employee-skills/${id}`, payload),

  /** DELETE /api/employee-skills/:id  (soft remove) */
  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/employee-skills/${id}`),
};
