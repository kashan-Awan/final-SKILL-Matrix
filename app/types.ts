export interface Department {
  id?: string;
  name: string;
  area?: string;
  description?: string;
  headOfDepartment?: string;
  employeeCount?: number;
}

export interface Employee {
  id: string;
  employeeId?: string;
  displayId?: string;
  name: string;
  email: string;
  department: string;
  departmentId?: string;
  position: string;
  skillLevel: string;
  shift: string;
  employmentType: string;
  salary: number;
  hireDate: string;
  manager: string;
  isActive: boolean;
  skillCount: number;
  totalSkills?: number;
  skills: Record<string, string>;
  yearsExperience: number;
  gender: string;
  title: string;
  factory?: string;
  performanceScore: number;
  certifications?: string[];
  [key: string]: unknown;
}

export interface ManufacturingEmployee extends Employee {
  area?: string;
  machineSkills?: string[];
}

export interface EmployeeHistory {
  id: string;
  employeeId?: string;
  employeeName?: string;
  name: string;
  email: string;
  department: string;
  currentDepartment?: string;
  currentStartDate?: string;
  position: string;
  gender: string;
  joinDate?: string;
  currentSkills?: Record<string, string>;
  departmentHistory: Array<{
    department?: string;
    departmentName?: string;
    from?: string;
    to?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    [key: string]: unknown;
  }>;
  skillHistory: Array<{
    skill?: string;
    machineName?: string;
    currentLevel?: string;
    acquiredDate?: string;
    lastUpdated?: string;
    levelProgression: Array<{ level: string; date: string }>;
    [key: string]: unknown;
  }>;
}

// ✅ SkillMatrix types
export interface MatrixData {
  employees: Employee[];
  skills: string[];
}

export interface SkillMatrix {
  _id: string;
  name: string;
  departmentId?: string;
  department?: string;
  description?: string;
  employeeCount?: number;
  skillCount?: number;
  matrixData?: MatrixData;
  isActive?: number;
  version?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}