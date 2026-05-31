
export interface Machine {
  id: number;
  name: string;
  machine_id: string;
  department_id: number;
  type: string;
  manufacturer?: string;
  model?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  install_date?: Date;
  last_maintenance_date?: Date;
  specifications?: object;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
