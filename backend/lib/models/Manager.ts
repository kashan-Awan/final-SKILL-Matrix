
export interface Manager {
  id: number;
  password?: string;
  name: string;
  email: string;
  departmentId: number;
  phone?: string;
  employeeId: string;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
