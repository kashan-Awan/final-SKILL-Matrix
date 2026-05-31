export interface Skill {
  id: number;
  name: string;
  description?: string;
  category: 'MACHINE' | 'LABOUR' | 'TECHNICAL' | 'SAFETY';
  is_machine_related: boolean;
  is_critical: boolean;
  female_eligible: boolean;
  department_id?: number | null;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}















