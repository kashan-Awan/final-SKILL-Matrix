export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  level: 'None' | 'Low' | 'Medium' | 'High' | 'Expert';
  acquired_date?: Date;
  last_assessed_date?: Date;
  certification_date?: Date;
  notes?: string;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
