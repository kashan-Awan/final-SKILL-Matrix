export interface StaffingMachine {
  id: string
  name: string
  departmentId: string
  isCritical: boolean
  femaleEligible: boolean
  requiredSkills: string[]
  maxWorkers: number
  currentWorkers: number
}

export interface StaffingEmployee {
  id: string
  name: string
  cardNumber: string
  gender: "male" | "female"
  departmentId: string
  skills: Record<string, string>
  totalSkills: number
  isHighlySkilled: boolean
}

export interface StaffingAssignment {
  machineId: string
  employeeId: string
  assignedDate: string
  shiftType: "morning" | "afternoon" | "night"
}
