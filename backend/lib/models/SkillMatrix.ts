
export interface SkillMatrix {
  id: number;
  department_id: number;
  name: string;
  employee_id?: number;
  description?: string;
  matrix_data: object;
  version?: string;
  is_active?: boolean;
  created_by?: number | null;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
