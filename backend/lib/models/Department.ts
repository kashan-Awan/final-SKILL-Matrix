export interface Department {
  id: number;
  name: string;
  description?: string;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
