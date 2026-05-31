"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  X,
  Edit3,
  Eye,
  Save,
  CheckCircle,
  Building,
  Cog,
  Filter,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  Search,
  Trash2,
  Edit,
  Menu,
  Clock,
  Database,
  UserPlus,
  AlertCircle,
  Building2,
  Maximize,
  Minimize,
} from "lucide-react";
  
import { useEmployees } from "../../hooks/useEmployees";
import { useDepartments } from "../../hooks/useDepartments";
import { useSkillMatrices } from "../../hooks/useSkillMatrices";
import { useSkills } from "../../hooks/useSkills";
import DatabaseLoading from "../components/DatabaseLoading";
import DatabaseError from "../components/DatabaseError";
import MachineTagBadge from "../components/MachineTagBadge";
import useUserPermissions from "../../hooks/useUserPermissions";
import { departmentsService } from "@/services/departments.service";
import { usersService } from "@/services/users.service";




const skillLevelColors = {
  None: { bg: "#9ca3af", text: "#ffffff", number: 0 }, // Gray = 0
  Low: { bg: "#ef4444", text: "#ffffff", number: 1 }, // Red = 1
  Medium: { bg: "#eab308", text: "#ffffff", number: 2 }, // Yellow = 2
  High: { bg: "#3b82f6", text: "#ffffff", number: 3 }, // Blue = 3
  Expert: { bg: "#10b981", text: "#ffffff", number: 4 }, // Green = 4
};

// Generate realistic skill levels based on employee experience
const generateSkillLevels = (employee: any, skills: string[]) => {
  const levels: { [key: string]: string } = {};
  const experienceYears = parseInt(employee.experience) || 1;

  skills.forEach((skill: string) => {
    // Base skill level on experience with some randomization
    let level;
    if (experienceYears >= 4) {
      level = Math.random() > 0.3 ? "Expert" : "High";
    } else if (experienceYears >= 2) {
      level = Math.random() > 0.4 ? "High" : "Medium";
    } else {
      level = Math.random() > 0.5 ? "Medium" : "Low";
    }
    levels[`${employee.name}-${skill}`] = level;
  });

  return levels;
};

const PieChartSkillIndicator = ({
  level,
  size = 80,
}: {
  level: string;
  size?: number;
}) => {
  const colors = skillLevelColors[level as keyof typeof skillLevelColors] || {
    bg: "#e5e7eb",
    text: "#6b7280",
    number: 0,
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className="rounded-full flex items-center justify-center font-bold text-white transition-transform hover:scale-110"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: colors.bg,
          fontSize: `${size * 0.2}px`,
        }}
      >
        {colors.number}
      </div>
    </div>
  );
};

const SaveSuccessPopup = ({
  isVisible,
  onClose,
  matrixName,
  saveResult,
}: {
  isVisible: boolean;
  onClose: () => void;
  matrixName: string;
  saveResult?: any;
}) => {
  if (!isVisible) return null;

  const handleViewMapping = () => {
    window.open("/skills-mapping", "_blank");
    onClose();
  };

  const handleViewEmployees = () => {
    window.open("/employees", "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Matrix Saved Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            "{matrixName}" has been saved and is now available in your matrices
            library.
          </p>

          {saveResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">
                What was created:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Skills Matrix: "{matrixName}"</li>
                {saveResult.skillsCreated > 0 && (
                  <li>
                    ✓ New Skills: {saveResult.skillsCreated} skills added to
                    database
                  </li>
                )}
                {saveResult.employeesProcessed > 0 && (
                  <li>
                    ✓ Employee Skills: Updated skills for{" "}
                    {saveResult.employeesProcessed} employees
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleViewMapping}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              View in Skills Mapping
            </Button>

            {saveResult && saveResult.employeesProcessed > 0 && (
              <Button
                onClick={handleViewEmployees}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <User className="h-4 w-4 mr-2" />
                View Updated Employees
              </Button>
            )}

            <Button onClick={onClose} variant="outline" className="w-full">
              Continue Editing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add New Employee to Database Dialog
const AddEmployeeDialog = ({
  isOpen,
  onClose,
  onAddEmployee,
  departmentId,
  departmentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: any) => void;
  departmentId: string;
  departmentName: string;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [empId, setEmpId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleReset = () => {
    setName("");
    setEmail("");
    setEmpId("");
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "employee",
        password: "Dawlance@123",
        departmentId,
      };
      if (empId.trim()) payload.employeeId = empId.trim();

      const result = await usersService.create(payload);
      if (result.success && result.data) {
        const emp = result.data as any;
        onAddEmployee({
          id: emp.id || emp._id || emp.employeeId,
          name: emp.name,
          department: departmentName,
          departmentId,
          joinDate: new Date().toISOString().split("T")[0],
          experience: "0 years",
          yearsExperience: 0,
          gender: null,
        });
        handleReset();
        onClose();
      } else {
        setError(
          (result as any).message ||
            "Failed to create employee. Email may already exist."
        );
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Creates a new employee in <strong>{departmentName}</strong> and adds
            them to this matrix.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ahmed Khan"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmed.khan@dawlance.com"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              placeholder="e.g., EMP-001"
              disabled={saving}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Default login password:{" "}
            <code className="bg-gray-100 px-1 rounded">Dawlance@123</code> —
            employee can change it after first login.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving || !name.trim() || !email.trim()}
            >
              {saving ? "Creating..." : "Create & Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// New Department Creation Dialog
const CreateDepartmentDialog = ({
  isOpen,
  onClose,
  onCreateDepartment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateDepartment: (department: any) => void;
}) => {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentArea, setDepartmentArea] = useState("");

  const handleCreate = () => {
    if (departmentName.trim() && departmentArea.trim()) {
      const newDepartment = {
        id: departmentName.toLowerCase().replace(/\s+/g, "-"),
        name: departmentName.trim(),
        area: departmentArea.trim(),
      };
      onCreateDepartment(newDepartment);
      setDepartmentName("");
      setDepartmentArea("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Department
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Name
            </label>
            <Input
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g., Blow Molding"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <Select value={departmentArea} onValueChange={setDepartmentArea}>
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="QC">Quality Control</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={!departmentName.trim() || !departmentArea.trim()}
            >
              Create Department
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Empty State Component for No Employees
const NoEmployeesState = ({
  departmentName,
  onAddEmployee,
}: {
  departmentName: string;
  onAddEmployee: () => void;
}) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Employees Found
      </h3>
      <p className="text-gray-600 mb-6">
        There are no employees in the {departmentName} department yet.
      </p>
      <Button onClick={onAddEmployee} className="bg-blue-600 hover:bg-blue-700">
        <UserPlus className="h-5 w-5 mr-2" />
        Add Employee
      </Button>
    </div>
  );
};

const SkillsMatrixManager = () => {
  const { permissions, userEmail, userRole, userEmployeeId } = useUserPermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matrixId = searchParams.get("matrixId");
  const [currentStep, setCurrentStep] = useState(1);
  const [matrixName, setMatrixName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [skillLevels, setSkillLevels] = useState<{ [key: string]: string }>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);
  const [showFinalTable, setShowFinalTable] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);

  // Database hooks
  const {
    employees: dbEmployees,
    loading: employeesLoading,
    error: employeesError,
  } = useEmployees();
  const {
    departments: dbDepartments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();
  const {
    matrices,
    loading: matricesLoading,
    error: matricesError,
    saveMatrix,
    updateMatrix,
    deleteMatrix,
    refetch: refetchMatrices,
    getMatrixById,
  } = useSkillMatrices();






  const {
    skills: dbSkills,
    loading: skillsLoading,
    error: skillsError,
    getSkillsByDepartment,
  } = useSkills();
  // Removed useMachines hook as system now uses Skills table only

  // New state for department and employee management
  const [departments, setDepartments] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);

  // Load data from database when available
  useEffect(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      setDepartments(
        dbDepartments.map((dept) => ({
          id: dept.id,
          // ...existing code...
          name: dept.name,
          area: dept.area || "Production",
        }))
      );
    } else {
      // Start with empty departments array - all data comes from database
      setDepartments([]);
    }
  }, [dbDepartments]);

  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      setAllEmployees(
        dbEmployees.map((emp) => ({
          id: emp.id || emp.employeeId,
          name: emp.name,
          department: emp.department, // Keep the department name as is
          departmentId:
            departments.find((d) => d.name === emp.department)?.id ||
            emp.department, // Map to department ID
          area: "Production", // Default area since Employee type doesn't have area property
          joinDate: emp.hireDate,
          experience: `${emp.yearsExperience} years`,
          gender: emp.gender,
          yearsExperience: emp.yearsExperience,
        }))
      );
    } else {
      // Start with empty employees array - all data comes from database
      setAllEmployees([]);
    }
  }, [dbEmployees, departments]);



  const steps = [
    {
      id: 1,
      title: "Matrix Setup",
      desc: "Name your matrix and select department",
    },
    {
      id: 2,
      title: "Select Employees",
      desc: "Choose employees for the matrix (rows)",
    },
    { id: 3, title: "Add Skills", desc: "Define skills/machines (columns)" },
    { id: 4, title: "Preview & Save", desc: "Review and save your matrix" },
  ];

  const filteredEmployees = allEmployees.filter((emp) => {
    if (!selectedDepartment) return false;

    // Get the selected department object
    const selectedDept = departments.find((d) => d.id === selectedDepartment);
    if (!selectedDept) return false;

    // Match by department name (this should work for both database and fallback employees now)
    const isMatch = emp.department === selectedDept.name;

    if (process.env.NODE_ENV === "development") {
      console.log({
        employeeName: emp.name,
        employeeDepartment: emp.department,
        selectedDepartmentName: selectedDept.name,
        isMatch,
      });
    }

    return (
      isMatch && emp.name.toLowerCase().includes(employeeFilter.toLowerCase())
    );
  });

  const availableEmployees = filteredEmployees.filter(
    (emp) => !selectedEmployees.find((selected) => selected.id === emp.id)
  );

  // Get department skills from database
  const departmentSkills = selectedDepartment
    ? getSkillsByDepartment(selectedDepartment)
    : [];

  // Use skills for the available options
  const availableSkillsAndMachines = departmentSkills.map((skill) => ({
    name: skill.name,
    type: "skill",
    data: skill,
  }));

  const filteredSkills = availableSkillsAndMachines.filter(
    (item) =>
      item.name.toLowerCase().includes(skillFilter.toLowerCase()) &&
      !skills.includes(item.name)
  );

  // Initialize skill levels when employees and skills are selected (but not when loading existing matrix)
  useEffect(() => {
    
    // Only generate skill levels if we're creating a NEW matrix, not loading an existing one
    if (selectedEmployees.length > 0 && skills.length > 0 && !selectedMatrix) {
      const newSkillLevels = {};
      selectedEmployees.forEach((employee) => {
        const employeeSkillLevels = generateSkillLevels(employee, skills);
        Object.assign(newSkillLevels, employeeSkillLevels);
      });
      setSkillLevels((prev) => {
        const merged = { ...prev, ...newSkillLevels };
        return merged;
      });
    } else if (selectedMatrix) {
    } else {
    }
  }, [selectedEmployees, skills, selectedMatrix]);

  // Load specific matrix if matrixId is provided in URL
  useEffect(() => {
    const loadSpecificMatrix = async () => {
      if (matrixId && matrices.length > 0) {
        const matrix = matrices.find((m) => m.id?.toString() === matrixId);
        if (matrix) {
          loadMatrix(matrix);
        }
      }
    };

    loadSpecificMatrix();
  }, [matrixId, matrices]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setSidebarOpen(false); // Close sidebar when entering fullscreen
    }
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  // Department management functions
  const handleCreateDepartment = async (newDepartment: any) => {
    try {
      const result = await departmentsService.create({
        name: newDepartment.name,
        area: newDepartment.area,
      } as any);
      if (result.success && result.data) {
        const created = {
          id: (result.data as any).id || (result.data as any)._id,
          name: (result.data as any).name,
          area: (result.data as any).area || newDepartment.area,
        };
        setDepartments((prev) => [...prev, created]);
        setSelectedDepartment(created.id);
      } else {
        alert(
          "Failed to create department: " +
            ((result as any).message || "Unknown error")
        );
      }
    } catch {
      alert("Error creating department. Please try again.");
    }
  };

  // Employee management functions
  const handleAddEmployee = () => {
    setShowAddEmployeeDialog(true);
  };

  const addEmployee = (employee: any) => {
    setSelectedEmployees([...selectedEmployees, employee]);
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp.id !== employeeId)
    );
  };

  const addNewEmployeeRow = () => {
    setShowAddEmployeeDialog(true);
  };

  const deleteEmployeeRow = (employeeId: string) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp.id !== employeeId)
    );
  };

  const updateEmployeeName = (employeeId: string, newName: string) => {
    setSelectedEmployees(
      selectedEmployees.map((emp) =>
        emp.id === employeeId ? { ...emp, name: newName } : emp
      )
    );
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addPredefinedSkill = (skillItem: any) => {
    if (!skills.includes(skillItem.name)) {
      setSkills([...skills, skillItem.name]);
    }
  };

  const addNewSkillColumn = () => {
    const newSkill = "New Skill";
    setSkills([...skills, newSkill]);
    setEditingSkill(skills.length);
  };

  const deleteSkillColumn = (skillIndex: number) => {
    const skillToRemove = skills[skillIndex];
    setSkills(skills.filter((_, index) => index !== skillIndex));
    const updatedSkillLevels = { ...skillLevels };
    selectedEmployees.forEach((emp) => {
      const keyToDelete = `${emp.name}-${skillToRemove}`;
      delete updatedSkillLevels[keyToDelete];
    });
    setSkillLevels(updatedSkillLevels);
  };

  const updateSkillName = (skillIndex: number, newName: string) => {
    const oldSkill = skills[skillIndex];
    const updatedSkills = [...skills];
    updatedSkills[skillIndex] = newName;
    setSkills(updatedSkills);

    const updatedSkillLevels = { ...skillLevels };
    selectedEmployees.forEach((emp) => {
      const oldKey = `${emp.name}-${oldSkill}`;
      const newKey = `${emp.name}-${newName}`;
      if (updatedSkillLevels[oldKey]) {
        updatedSkillLevels[newKey] = updatedSkillLevels[oldKey];
        delete updatedSkillLevels[oldKey];
      }
    });
    setSkillLevels(updatedSkillLevels);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillChange = (
    employeeName: string,
    skill: string,
    level: string
  ) => {
    const key = `${employeeName}-${skill}`;
    setSkillLevels((prev) => {
      const newState = {
        ...prev,
        [key]: level,
      };
      return newState;
    });
  };

  const getSkillLevel = (employee: any, skill: string) => {
    const key = `${employee.name}-${skill}`;
    const level = skillLevels[key] || "None";
    
    // Enhanced debug logging to help troubleshoot
    if (process.env.NODE_ENV === "development") {
      console.log({
        availableKeys: Object.keys(skillLevels),
        requestedKey: key,
        allSkillLevels: skillLevels,
        employeeName: employee.name,
        skillName: skill,
        selectedMatrixSkillLevels: selectedMatrix?.matrixData?.skillLevels
      });
      
      // Check if the key exists in selectedMatrix
      if (selectedMatrix?.matrixData?.skillLevels) {
        const matrixLevel = selectedMatrix.matrixData.skillLevels[key];
        if (matrixLevel) {
          if (matrixLevel.toLowerCase() !== level.toLowerCase()) {
            console.error(`MISMATCH DETECTED for ${key}:`, {
              localStateLevel: level,
              matrixLevel: matrixLevel,
              shouldBe: matrixLevel
            });
          }
        } else {
        }
      }
    }
    
    return level;
  };
  const handleUpdate = async () => {

    try{
      const existingMatrix = matrices.find((m) => m.name === matrixName);
    if (!existingMatrix) {
      alert("Matrix not found");
      return;
    }
    const selectedDept = departments.find((d) => d.id === selectedDepartment);
    if (!selectedDept) {
      console.error("Selected department not found");
      alert(
        "Selected department not found. Please select a valid department."
      );
      return;
    }
    const userId = userEmployeeId || userEmail;
      if (!userId) {
          alert("User ID is required! Please log in again.")
          return;
      }

    // Structure the data according to the expected format
    const updatedMatrixData = {
      name: existingMatrix.name,
      employeeId: userId,
      departmentId: existingMatrix.departmentId,
      description: existingMatrix.description,
      matrixData: {
        employees: selectedEmployees,
        skills: skills,
        skillProperties: skills.map(skillName => {
          const skillFromDB = departmentSkills.find(dbSkill => dbSkill.name === skillName);
          return {
            name: skillName,
            isCritical: skillFromDB?.is_critical || false,
            femaleEligible: skillFromDB?.female_eligible !== false
          };
        }),
        skillLevels: skillLevels,
        employeeCount: selectedEmployees.length,
        skillCount: skills.length
      },
      version: existingMatrix?.version || '1.0',
      isActive: true
    };


    const result = await updateMatrix(existingMatrix.id, updatedMatrixData);

    if (result.success) {
      setSaved(true);
      setShowSuccessPopup(true);
      setTimeout(() => setSaved(false), 2000);

      // Show success message
      alert("Skills matrix updated successfully!");
      
      // Use the new matrix data returned from the update
      if (result.data) {
        
        // Update the URL with the new matrix ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('matrixId', result.data.id);
        window.history.replaceState({}, '', newUrl.toString());
        
        setSelectedMatrix(result.data);
        loadMatrix(result.data);
      } else {
        // Fallback: refresh matrices and exit edit mode
        await refetchMatrices();
        setIsEditMode(false);
      }
    } else {
      console.error("Failed to update skills matrix");
      alert("Failed to update skills matrix. Please try again.");
    }


   
  } catch (error) {
    console.error("Error updating skills matrix:", error);
    alert(
      `Error updating skills matrix: ${error instanceof Error ? error.message : "Unknown error occurred"
      }`
    );
  }
  }


  const handleSave = async () => {
    try {
      const selectedDept = departments.find((d) => d.id === selectedDepartment);
      if (!selectedDept) {
        console.error("Selected department not found");
        alert(
          "Selected department not found. Please select a valid department."
        );
        return;
      }

      // Validate required fields
      if (!matrixName.trim()) {
        alert("Matrix name is required");
        return;
      }

      if (selectedEmployees.length === 0) {
        alert("At least one employee must be selected");
        return;
      }

      if (skills.length === 0) {
        alert("At least one skill must be added");
        return;
      }


      const trimmedName = matrixName.trim();
      if (trimmedName) {
        const duplicate = matrices.find((m) => m.name.toLowerCase() === matrixName.toLowerCase());
        if (duplicate) {
          alert("Matrix with this name already exists. Please choose a different name.");
          return;
        }
      }

      // use the actual _id (FK to dawlance_user._id), not the email
      const employeeId = userEmployeeId || userEmail;
      // Structure the data according to the expected format
      const matrixData = {
        name: matrixName.trim(),
        employeeId: employeeId,
        departmentId: selectedDept.id, // Use SQL id
        description: `Skills matrix for ${selectedDept.name} department`,
        matrixData: {
          employees: selectedEmployees,
          skills: skills, // Keep as simple string array
          skillProperties: skills.map(skillName => {
            // Store skill properties separately to maintain compatibility
            const skillFromDB = departmentSkills.find(dbSkill => dbSkill.name === skillName);
            return {
              name: skillName,
              isCritical: skillFromDB?.is_critical || false,
              femaleEligible: skillFromDB?.female_eligible !== false
            };
          }),
          skillLevels: skillLevels,
          version: 1,
          isActive: true,
          is_deleted: false,
          createdAt: new Date(),
          updatedAt: new Date() 

        },
      };


      const result = await saveMatrix(matrixData);
      if (result.success) {
        setSaved(true);

        // Set save result with details about what was created
        if (result.data) {
          setSaveResult({
            skillsCreated: result.data.skillsCreated || 0,
            employeesProcessed: result.data.employeesProcessed || 0,
          });
        }

        setShowSuccessPopup(true);
        setTimeout(() => setSaved(false), 2000);

        // Show success message
      } else {
        console.error("Failed to save skills matrix:", result.error);
        alert(`Failed to save skills matrix: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving skills matrix:", error);
      alert(
        `Error saving skills matrix: ${error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const loadMatrix = (matrix: any) => {
    setMatrixName(matrix.name);
    setSelectedDepartment(matrix.departmentId);
    setSelectedEmployees(matrix.matrixData?.employees || []);

    // Ensure skills is always an array of strings, even if old data has objects
    const matrixSkills = matrix.matrixData?.skills || [];
    const skillStrings = matrixSkills.map((skill: any) => {
      // If skill is an object with name property, extract the name
      // If skill is already a string, use it as is
      return typeof skill === 'object' && skill.name ? skill.name : skill;
    });
    setSkills(skillStrings);

    // Load skill levels from the matrix data
    const loadedSkillLevels = matrix.matrixData?.skillLevels || {};
    const employees = matrix.matrixData?.employees || [];
    
    
    // Log each skill level entry from the matrix
    Object.entries(loadedSkillLevels).forEach(([key, value]) => {
    });
    
    // Ensure skill levels are properly formatted with employee-skill keys
    const formattedSkillLevels: { [key: string]: string } = {};
    
    // DIRECTLY copy the loaded skill levels without modification first
    Object.keys(loadedSkillLevels).forEach(key => {
      formattedSkillLevels[key] = loadedSkillLevels[key];
    });
    
    // Fill in any missing skill levels with default values
    employees.forEach((employee: any) => {
      skillStrings.forEach((skill: string) => {
        const key = `${employee.name}-${skill}`;
        if (!formattedSkillLevels[key]) {
          formattedSkillLevels[key] = "None";
        }
      });
    });
    
    Object.entries(formattedSkillLevels).forEach(([key, value]) => {
    });
    
    
    // Add a listener to track all changes to skillLevels
    
    setSkillLevels(formattedSkillLevels);
    
    
    // Add a small delay to check if state was set correctly
    setTimeout(() => {
    }, 100);
    
    setSelectedMatrix(matrix);
    setShowFinalTable(true);
    setSidebarOpen(false);
    setIsEditMode(false);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return matrixName.trim() && selectedDepartment;
      case 2:
        return selectedEmployees.length > 0;
      case 3:
        return skills.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const resetMatrix = () => {
    setCurrentStep(1);
    setMatrixName("");
    setSelectedDepartment("");
    setSelectedEmployees([]);
    setSkills([]);
    setSkillLevels({});
    setShowFinalTable(false);
    setIsEditMode(false);
    setEditingEmployee(null);
    setEditingSkill(null);
    setSelectedMatrix(null);
    setIsFullscreen(false);
  };

  // Loading state
  if (
    employeesLoading ||
    departmentsLoading ||
    matricesLoading ||
    skillsLoading
  ) {
    return <DatabaseLoading />;
  }

  // Error state
  if (
    employeesError ||
    departmentsError ||
    matricesError ||
    skillsError
  ) {
    return (
      <DatabaseError
        error={
          employeesError ||
          departmentsError ||
          matricesError ||
          skillsError ||
          ""
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (showFinalTable) {
    return (
      <div
        className={`${isFullscreen
            ? "fixed inset-0 z-50 bg-white"
            : "min-h-screen min-w-full bg-white"
          } flex transition-all duration-300`}
      >
        <div className={`flex ${!isFullscreen ? "pt-20" : ""} w-full`}>
          {/* Sidebar - Hide in fullscreen */}
          {!isFullscreen && (
            <div
              className={`${sidebarOpen ? "w-80" : "w-0"
                } transition-all duration-300 bg-white shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Saved Matrices
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {matrices.map((matrix) => (
                    <div
                      key={matrix.id || (matrix as any)._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${selectedMatrix?.id === matrix.id
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      onClick={() => loadMatrix(matrix)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {matrix.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {
                          departments.find((d) => d.id === matrix.department)
                            ?.name
                        }
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{matrix.employeeCount} employees</span>
                        <span>{matrix.skillCount} skills</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(matrix.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {matrices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No saved matrices yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Main Content */}
          <div
            className={`flex-1 ${isFullscreen ? "p-0" : "p-6"} transition-all duration-300`}
          >
            <div
              className={`${isFullscreen ? "h-screen max-w-full" : "w-full px-6"
                } mx-auto`}
            >

              {/* Header - Minimal in fullscreen */}
              {!isFullscreen && (
                <div className="mb-6 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-orange-300 text-black font-semibold hover:bg-orange-50 hover:border-orange-400 transition-all duration-200"
                      >
                        <Menu className="h-4 w-4 mr-2" />
                        Matrices ({matrices.length})
                      </Button>
                      <Button
                        onClick={resetMatrix}
                        variant="outline"
                        className="border-2 border-blue-300 text-black font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                      >
                        ← Back to Matrix Builder
                      </Button>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    Skills Matrix
                  </h1>
                  <p className="text-xl text-gray-700 font-medium">
                    View and manage employee skill levels
                  </p>
                </div>
              )}

              <Card
                className={`border-0 ${isFullscreen
                    ? "bg-white h-screen rounded-none shadow-none"
                    : "bg-white/90 backdrop-blur-sm shadow-xl"
                  } transition-all duration-300`}
              >
                <CardHeader
                  className={`${isFullscreen ? "py-3 px-6" : "py-4"
                    } transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <CardTitle
                          className={`${isFullscreen ? "text-xl" : "text-2xl"
                            } text-black font-bold transition-all duration-300`}
                        >
                          {isFullscreen
                            ? `${matrixName} (${selectedEmployees.length} × ${skills.length})`
                            : matrixName}
                        </CardTitle>
                        {isEditMode && (
                          <Badge
                            variant="destructive"
                            className={`px-3 py-1 ${isFullscreen ? "text-xs" : "text-sm"
                              } bg-red-100 text-red-800 border border-red-300 font-semibold transition-all duration-300`}
                          >
                            <Edit3
                              className={`${isFullscreen ? "h-3 w-3" : "h-4 w-4"
                                } mr-1`}
                            />
                            {isFullscreen ? "Edit" : "Editing"}
                          </Badge>
                        )}
                        {!isEditMode && (
                          <Badge
                            variant="secondary"
                            className={`px-3 py-1 ${isFullscreen ? "text-xs" : "text-sm"
                              } bg-gray-100 text-gray-800 border border-gray-300 font-semibold transition-all duration-300`}
                          >
                            <Eye
                              className={`${isFullscreen ? "h-3 w-3" : "h-4 w-4"
                                } mr-1`}
                            />
                            {isFullscreen ? "View" : "View Only"}
                          </Badge>
                        )}
                      </div>
                      {!isFullscreen && (
                        <CardDescription className="text-lg text-gray-700 font-medium transition-all duration-300">
                          {selectedEmployees.length} employees • {skills.length}{" "}
                          skills
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {/* Fullscreen Toggle Button */}
                      <Button
                        onClick={toggleFullscreen}
                        size={isFullscreen ? "sm" : "default"}
                        variant="outline"
                        className={`${isFullscreen
                            ? "h-9 px-4 text-sm"
                            : "h-11 px-6 text-base"
                          } border-2 border-purple-300 text-black font-semibold rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 shadow-sm`}
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize className="h-4 w-4 mr-2" />
                            Exit Fullscreen

                          </>
                        ) : (
                          <>
                            <Maximize className="h-5 w-5 mr-2" />
                            Fullscreen
                          </>
                        )}
                      </Button>

                      {!isFullscreen && (
                        <Button
                          onClick={resetMatrix}
                          variant="outline"
                          size="default"
                          className="h-11 px-6 text-base border-2 border-blue-300 text-black font-semibold rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-sm"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Back
                        </Button>
                      )}

                      {permissions.canEditSkillsMatrix && (
                        <Button
                          onClick={() => setIsEditMode(!isEditMode)}
                          size={isFullscreen ? "sm" : "default"}
                          variant={isEditMode ? "destructive" : "secondary"}
                          className={`${isFullscreen
                              ? "h-9 px-4 text-sm"
                              : "h-11 px-6 text-base"
                            } border-2 ${isEditMode
                              ? "border-red-400 bg-red-50 text-red-800 hover:bg-red-100 hover:border-red-500"
                              : "border-gray-400 bg-gray-50 text-black hover:bg-gray-100 hover:border-gray-500"
                            } font-semibold rounded-lg transition-all duration-300 shadow-sm`}
                        >
                          {isEditMode ? (
                            <>
                              <Eye
                                className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                  } mr-2`}
                              />
                              {isFullscreen ? "View" : "View Mode"}
                            </>
                          ) : (
                            <>
                              <Edit3
                                className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                  } mr-2`}
                              />
                              {isFullscreen ? "Edit" : "Edit Mode"}
                            </>
                          )}
                        </Button>
                      )}

                      {isEditMode && (
                        <Button
                          onClick={handleUpdate}
                          size={isFullscreen ? "sm" : "default"}
                          className={`${isFullscreen
                              ? "h-9 px-4 text-sm"
                              : "h-11 px-6 text-base"
                            } bg-gradient-to-r from-[#4ADE80] to-[#22c55e] text-black font-bold border-2 border-green-400 rounded-lg hover:from-[#22c55e] hover:to-[#16a34a] hover:border-green-500 transition-all duration-300 shadow-md`}
                        >
                          {saved ? (
                            <>
                              <CheckCircle
                                className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                  } mr-2`}
                              />
                              {isFullscreen ? "Saved!" : "Saved!"}
                            </>
                          ) : (
                            <>
                              <Save
                                className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                  } mr-2`}
                              />
                              {isFullscreen ? "Save" : "Save Changes"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  className={`${isFullscreen ? "p-0 h-[calc(100vh-100px)]" : "p-4"
                    } transition-all duration-300`}
                >
                  <div
                    className={`${isFullscreen
                        ? "h-full border-0"
                        : "rounded-xl border-2 border-gray-300 shadow-lg"
                      } overflow-visible`}
                  >
                    <div
                      className={`${isFullscreen
                          ? "h-full overflow-auto"
                          : "overflow-x-auto overflow-y-auto max-h-[85vh]"
                        } ${skills.length >= 7 ? "overflow-x-scroll" : ""
                        } overflow-y-visible bg-white rounded-lg`}
                    >
                      <Table
                        className={`${skills.length >= 7 ? "min-w-max" : "min-w-full"
                          }`}
                      >
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-[#4ADE80] to-[#007270] hover:from-[#22c55e] hover:to-[#006663]">
                            <TableHead
                              className={`text-black bg-white font-bold ${isFullscreen
                                  ? "text-sm py-3 px-4"
                                  : "text-lg py-4 px-6"
                                } sticky left-0 z-20 min-w-[200px] border-r-2 border-gray-300 shadow-sm transition-all duration-300`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User
                                    className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                      }`}
                                  />
                                  <span
                                    className={`${isFullscreen ? "text-md" : "text-base"
                                      } font-bold text-black`}
                                  >
                                    Employee
                                  </span>
                                </div>
                                {isEditMode && (
                                  <Button
                                    onClick={addNewEmployeeRow}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 border border-green-700 text-white font-semibold shadow-sm"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableHead>
                            {skills.map((skill, index) => {
                              // Ensure skill is always a string (safety check for old data)
                              const skillName = typeof skill === 'object' && skill && (skill as any).name ? (skill as any).name : skill;

                              // Try to get skill properties from saved matrix data first, then fallback to database lookup
                              
                              
                              
                              let skillProperties = null;
                              if (selectedMatrix?.matrixData?.skillProperties) {
                                skillProperties = selectedMatrix.matrixData.skillProperties.find((prop: any) => prop.name === skillName);
                              }
                              // Fallback to database lookup if not found in matrix data
                              if (!skillProperties) {
                                const skillFromDB = departmentSkills.find(dbSkill => dbSkill.name === skillName);
                                skillProperties = {
                                  name: skillName,
                                  isCritical: skillFromDB?.is_critical || false,
                                  femaleEligible: skillFromDB?.female_eligible !== false
                                };
                              }

                              return (
                                <TableHead
                                  key={`skill-${index}`}
                                  className={`text-black bg-[#ffc26e] font-bold ${isFullscreen
                                      ? "text-sm py-3 px-4"
                                      : "text-lg py-4 px-6"
                                    } text-center min-w-[150px] whitespace-nowrap border-r border-orange-300 shadow-sm transition-all duration-300`}
                                >
                                  <div className="flex flex-col gap-1">
                                    {/* Skill badges row */}
                                    <div className="flex items-center justify-center gap-1">
                                      {skillProperties?.femaleEligible && (
                                        <MachineTagBadge
                                          femaleEligible={true}
                                          size="sm"
                                        />
                                      )}
                                      {skillProperties?.isCritical && (
                                        <MachineTagBadge
                                          isCritical={true}
                                          size="sm"
                                        />
                                      )}
                                    </div>

                                    {/* Skill name and controls row */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Cog
                                          className={`${isFullscreen ? "h-4 w-4" : "h-5 w-5"
                                            }`}
                                        />
                                        {editingSkill === index && isEditMode ? (
                                          <Input
                                            value={skill}
                                            onChange={(e) =>
                                              updateSkillName(index, e.target.value)
                                            }
                                            onBlur={() => setEditingSkill(null)}
                                            onKeyPress={(e) =>
                                              e.key === "Enter" &&
                                              setEditingSkill(null)
                                            }
                                            className="w-24 h-6 text-xs bg-white text-black border border-gray-300"
                                            autoFocus
                                          />
                                        ) : (
                                          <span
                                            onClick={() =>
                                              isEditMode && setEditingSkill(index)
                                            }
                                            className={`${isFullscreen ? "text-sm" : "text-base"
                                              } font-bold text-black ${isEditMode
                                                ? "cursor-pointer hover:bg-orange-200 px-2 py-1 rounded border border-orange-400"
                                                : ""
                                              }`}
                                          >
                                            {skill}
                                          </span>
                                        )}
                                      </div>
                                      {isEditMode && (
                                        <div className="flex gap-1">
                                          {index === skills.length - 1 && (
                                            <Button
                                              onClick={addNewSkillColumn}
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0 border border-green-700 text-white shadow-sm"
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          )}
                                          <Button
                                            onClick={() => deleteSkillColumn(index)}
                                            size="sm"
                                            variant="destructive"
                                            className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border border-red-700 text-white shadow-sm"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmployees.map((emp, idx) => (
                            <TableRow
                              key={`emp-${idx}`}
                              className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-orange-50 transition-colors duration-200`}
                            >
                              <TableCell
                                className={`font-semibold ${isFullscreen
                                    ? "text-sm py-4 px-4"
                                    : "text-base py-6 px-6"
                                  } sticky left-0 z-10 bg-inherit border-r-2 border-gray-300 shadow-sm transition-all duration-300`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`${isFullscreen ? "w-8 h-8" : "w-12 h-12"
                                        } bg-gradient-to-br from-[#4ADE80] to-[#007270] rounded-xl flex items-center justify-center shadow-md transition-all duration-300`}
                                    >
                                      <span
                                        className={`text-white font-bold ${isFullscreen ? "text-xs" : "text-sm"
                                          } transition-all duration-300`}
                                      >
                                        {emp.name
                                          .split(" ")
                                          .map((n: string) => n[0])
                                          .join("")
                                          .slice(0, 2)}
                                      </span>
                                    </div>
                                    <div>
                                      {editingEmployee === emp.id &&
                                        isEditMode ? (
                                        <Input
                                          value={emp.name}
                                          onChange={(e) =>
                                            updateEmployeeName(
                                              emp.id,
                                              e.target.value
                                            )
                                          }
                                          onBlur={() =>
                                            setEditingEmployee(null)
                                          }
                                          onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            setEditingEmployee(null)
                                          }
                                          className={`${isFullscreen
                                              ? "w-32 h-6 text-xs"
                                              : "w-40 h-8 text-sm"
                                            } mb-1 border border-gray-300 text-black`}
                                          autoFocus
                                        />
                                      ) : (
                                        <div
                                          onClick={() =>
                                            isEditMode &&
                                            setEditingEmployee(emp.id)
                                          }
                                          className={`font-bold ${isFullscreen
                                              ? "text-sm"
                                              : "text-base"
                                            } text-black transition-all duration-300 ${isEditMode
                                              ? "cursor-pointer hover:bg-gray-200 px-2 py-1 rounded border border-gray-300"
                                              : ""
                                            }`}
                                        >
                                          {emp.name}
                                        </div>
                                      )}
                                      <div
                                        className={`${isFullscreen ? "text-xs" : "text-sm"
                                          } text-gray-600 font-medium transition-all duration-300`}
                                      >
                                        ID: {emp.id}
                                      </div>
                                      <div
                                        className={`${isFullscreen ? "text-xs" : "text-xs"
                                          } text-gray-500 font-medium`}
                                      >
                                        {emp.experience} exp
                                      </div>
                                    </div>
                                  </div>
                                  {isEditMode && (
                                    <Button
                                      onClick={() => deleteEmployeeRow(emp.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border border-red-700 text-white shadow-sm"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              {skills.map((skill, skillIdx) => (
                                <TableCell
                                  key={`skill-${skillIdx}`}
                                  className={`${isFullscreen ? "py-4 px-4" : "py-6 px-6"
                                    } text-center transition-all duration-300`}
                                >
                                  {!isEditMode || saved ? (
                                    <div className="flex justify-center">
                                      <PieChartSkillIndicator
                                        level={getSkillLevel(emp, skill)}
                                        size={isFullscreen ? 40 : 60}
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <Select
                                        value={getSkillLevel(emp, skill)}
                                        onValueChange={(value) =>
                                          handleSkillChange(
                                            emp.name,
                                            skill,
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          className={`${isFullscreen ? "w-24" : "w-32"
                                            } transition-all duration-300`}
                                        >
                                          <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999] relative">
                                          {Object.entries(skillLevelColors).map(
                                            ([level]) => (
                                              <SelectItem
                                                key={level}
                                                value={level}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <PieChartSkillIndicator
                                                    level={level}
                                                    size={12}
                                                  />
                                                  <span className="text-xs">
                                                    {level}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <SaveSuccessPopup
            isVisible={showSuccessPopup}
            onClose={() => setShowSuccessPopup(false)}
            matrixName={matrixName}
            saveResult={saveResult}
          />{" "}
          {/* Fullscreen hint */}
          {isFullscreen && (
            <div className="fixed top-4 right-4 bg-gradient-to-r from-[#4ADE80] to-[#007270] text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
              Press{" "}
              <kbd className="bg-white/20 px-2 py-1 rounded ml-1 mr-1">Esc</kbd>{" "}
              to exit fullscreen
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      <div className="p-4 pt-20">
        <div className="max-w-full mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Skills Matrix Builder
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Create and manage employee skill matrices
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 shadow-md
                  ${currentStep >= step.id
                        ? "bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-lg border-2 border-orange-300"
                        : "bg-gray-200 text-gray-600 border-2 border-gray-300"
                      }
                `}
                  >
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                    w-24 h-2 mx-4 transition-all duration-200 rounded-full shadow-sm
                    ${currentStep > step.id
                          ? "bg-gradient-to-r from-orange-500 to-blue-500"
                          : "bg-gray-300"
                        }
                  `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-lg text-gray-700 font-medium">{steps[currentStep - 1].desc}</p>
            </div>
          </div>

          <Card className="border-2 border-gray-300 bg-white/95 backdrop-blur-sm mb-4 shadow-2xl rounded-xl">
            <CardContent className="p-4">
              {currentStep === 1 && (
                <div className="space-y-8 min-h-[45vh] flex flex-col justify-center">
                  <div className="max-w-3xl mx-auto w-full space-y-4 text-center items-center">
                    <div className="text-center items-center">
                      <label className="block text-2xl font-bold text-gray-800 mb-4">
                        Matrix Name
                      </label>
                      <Input
                        value={matrixName}
                        onChange={(e) => setMatrixName(e.target.value)}
                        placeholder="Enter matrix name (e.g., Plastic Extrusion Skills)"
                        className="w-full h-16 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-200 shadow-lg font-medium text-black placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-2xl font-bold text-gray-800">
                          Department
                        </label>
                        <Button
                          onClick={() => setShowCreateDepartment(true)}
                          size="default"
                          variant="outline"
                          className="border-2 border-green-400 text-black font-semibold hover:bg-green-50 hover:border-green-500 transition-all duration-200 shadow-md rounded-lg px-6 py-3"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          New Department
                        </Button>
                      </div>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger className="w-full h-16 text-lg border-2 border-gray-300 rounded-xl hover:border-blue-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 shadow-lg font-medium text-black">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-gray-300 shadow-2xl rounded-xl">
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id} className="text-lg py-4 hover:bg-blue-50">
                              <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-black">{dept.name} ({dept.area})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Table Rows: Employees
                    </h3>
                    <p className="text-orange-800">
                      Each employee you select will become a row in your skills
                      matrix table.
                    </p>
                  </div>

                  {availableEmployees.length === 0 &&
                    filteredEmployees.length === 0 ? (
                    <NoEmployeesState
                      departmentName={
                        departments.find((d) => d.id === selectedDepartment)
                          ?.name || "selected"
                      }
                      onAddEmployee={handleAddEmployee}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">
                            Available Employees
                          </h3>
                          <Badge variant="secondary">
                            {availableEmployees.length}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              value={employeeFilter}
                              onChange={(e) =>
                                setEmployeeFilter(e.target.value)
                              }
                              placeholder="Search employees..."
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {availableEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">
                                    {emp.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{emp.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {emp.id} • {emp.experience}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addEmployee(emp)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {availableEmployees.length === 0 &&
                            filteredEmployees.length > 0 && (
                              <div className="text-center py-4 text-gray-500">
                                All employees from this department are already
                                selected
                              </div>
                            )}
                        </div>
                        {filteredEmployees.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-800">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Need more employees?
                                <Button
                                  variant="link"
                                  className="p-0 ml-1 h-auto text-blue-600 hover:text-blue-800"
                                  onClick={handleAddEmployee}
                                >
                                  Add new employees
                                </Button>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">
                            Selected Employees
                          </h3>
                          <Badge variant="default">
                            {selectedEmployees.length}
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {selectedEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">
                                    {emp.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{emp.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {emp.id} • {emp.experience}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeEmployee(emp.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {selectedEmployees.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No employees selected yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Cog className="h-5 w-5" />
                      Table Columns: Skills/Machines
                    </h3>
                    <p className="text-blue-800">
                      Each skill you add will become a column in your skills
                      matrix table.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold">
                          Available Skills
                        </h3>
                        <Badge variant="secondary">
                          {filteredSkills.length}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            placeholder="Search skills..."
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredSkills.map((skillItem, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Cog className="h-5 w-5 text-gray-600" />
                              <div>
                                <span className="font-medium text-sm">
                                  {skillItem.name}
                                </span>
                                <div className="text-xs text-gray-500 capitalize">
                                  {skillItem.type}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addPredefinedSkill(skillItem)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {filteredSkills.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            {skillFilter
                              ? "No skills match your search"
                              : "No more skills available"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Add Custom Skill
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Enter custom skill name"
                            onKeyPress={(e) => e.key === "Enter" && addSkill()}
                          />
                          <Button
                            onClick={addSkill}
                            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Custom Skill
                          </Button>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the predefined skills from
                            the left panel or create your own custom skills.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold">
                          Selected Skills
                        </h3>
                        <Badge variant="default">{skills.length}</Badge>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-center gap-3">
                              <Cog className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-sm">
                                {skill}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeSkill(skill)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {skills.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            No skills selected yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Matrix Summary
                    </h3>
                    <p className="text-purple-800">
                      Review your matrix configuration before creating the final
                      table.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Matrix Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Name:</span>
                            <p className="text-gray-600">{matrixName}</p>
                          </div>
                          <div>
                            <span className="font-medium">Department:</span>
                            <p className="text-gray-600">
                              {
                                departments.find(
                                  (d) => d.id === selectedDepartment
                                )?.name
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Employees (Rows)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">
                            {selectedEmployees.length} employees selected
                          </p>
                          <div className="max-h-32 overflow-y-auto">
                            {selectedEmployees.map((emp, idx) => (
                              <p key={idx} className="text-sm text-gray-600">
                                • {emp.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-black-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Cog className="h-5 w-5" />
                          Skills (Columns)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">
                            {skills.length} skills added
                          </p>
                          <div className="max-h-32 overflow-y-auto">
                            {skills.map((skill, idx) => (
                              <p key={idx} className="text-sm text-gray-600">
                                • {skill}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center space-y-4">
                    {/* Save Button */}
                    {permissions.canCreateSkillsMatrix && (
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={handleSave}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        {saved ? (
                          <>
                            <CheckCircle className="h-6 w-6 mr-2" />
                            Saved Successfully!
                          </>
                        ) : (
                          <>
                            <Save className="h-6 w-6 mr-2" />
                            Save Skills Matrix
                          </>
                        )}
                      </Button>
                    </div>
                    )}

                    {/* Preview Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowFinalTable(true)}
                        size="lg"
                        variant="outline"
                        className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <FileText className="h-6 w-6 mr-2" />
                        Preview Skills Matrix Table
                      </Button>
                    </div>

                    {saved && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium">
                          ✅ Matrix saved successfully! You can now view it in
                          the
                          <Button
                            variant="link"
                            className="p-0 ml-1 text-green-600 hover:text-green-800"
                            onClick={() =>
                              window.open("/skills-mapping", "_blank")
                            }
                          >
                            Skills Mapping page
                          </Button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-gray-400 text-black font-semibold hover:bg-gray-50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={currentStep === 4 || !canProceedToNext()}
              size="lg"
              className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-bold border-2 border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg rounded-xl"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Department Dialog */}
      <CreateDepartmentDialog
        isOpen={showCreateDepartment}
        onClose={() => setShowCreateDepartment(false)}
        onCreateDepartment={handleCreateDepartment}
      />
      <AddEmployeeDialog
        isOpen={showAddEmployeeDialog}
        onClose={() => setShowAddEmployeeDialog(false)}
        onAddEmployee={(newEmp) => {
          setAllEmployees((prev) => [...prev, newEmp]);
          setSelectedEmployees((prev) => [...prev, newEmp]);
        }}
        departmentId={selectedDepartment}
        departmentName={
          departments.find((d) => d.id === selectedDepartment)?.name ||
          "this department"
        }
      />
    </div>
  );
};

// Wrapper component with Suspense for useSearchParams
export default function SkillsMatrixPage() {
  return (
    <Suspense fallback={<DatabaseLoading />}>
      <SkillsMatrixManager />
    </Suspense>
  );
}
