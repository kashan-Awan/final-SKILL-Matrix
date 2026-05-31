export interface Employee {
  id: number;
  name: string;
  employeeId: string;
  departmentId: number;
  gender: 'Male' | 'Female';
  title: string;
  email?: string;
  phone?: string;
  date_of_birth?: Date;
  hire_date?: Date;
  skillLevel?: string;
  years_experience?: number;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
