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
  Save,
  CheckCircle,
  Building,
  Cog,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  Search,
  Trash2,
  Menu,
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
import useUserPermissions from "../../hooks/useUserPermissions";
import { departmentsService } from "@/services/departments.service";
import { usersService } from "@/services/users.service";

const skillLevelColors = {
  None: { bg: "#9ca3af", text: "#ffffff", number: 0 },
  Low: { bg: "#ef4444", text: "#ffffff", number: 1 },
  Medium: { bg: "#eab308", text: "#ffffff", number: 2 },
  High: { bg: "#3b82f6", text: "#ffffff", number: 3 },
  Expert: { bg: "#10b981", text: "#ffffff", number: 4 },
};

const generateSkillLevels = (employee: any, skills: string[]) => {
  const levels: { [key: string]: string } = {};
  const experienceYears = employee.yearsExperience || 1;

  skills.forEach((skill: string) => {
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

const PieChartSkillIndicator = ({ level, size = 20 }: { level: string; size?: number }) => {
  const cleanLevel = (level || "None").trim().toUpperCase();
  
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  switch (cleanLevel) {
    case "EXPERT":
      return (
        <div className="flex items-center justify-center" title="Expert (Level 4)">
          <svg width={size} height={size} className="text-emerald-500 fill-emerald-500 transition-transform hover:scale-110 duration-200 cursor-pointer">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} />
            <path d={`M ${center - size*0.18} ${center} L ${center - size*0.05} ${center + size*0.12} L ${center + size*0.22} ${center - size*0.15}`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    case "HIGH":
      return (
        <div className="flex items-center justify-center" title="High (Level 3)">
          <svg width={size} height={size} className="text-blue-500 fill-blue-500 transition-transform hover:scale-110 duration-200 cursor-pointer">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />
            <path d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - radius} ${center} Z`} />
          </svg>
        </div>
      );
    case "MEDIUM":
      return (
        <div className="flex items-center justify-center" title="Medium (Level 2)">
          <svg width={size} height={size} className="text-amber-500 fill-amber-500 transition-transform hover:scale-110 duration-200 cursor-pointer">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />
            <path d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} Z`} />
          </svg>
        </div>
      );
    case "LOW":
      return (
        <div className="flex items-center justify-center" title="Low (Level 1)">
          <svg width={size} height={size} className="text-red-500 fill-red-500 transition-transform hover:scale-110 duration-200 cursor-pointer">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />
            <path d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius} ${center} Z`} />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center" title="None (Level 0)">
          <svg width={size} height={size} className="text-gray-300 dark:text-gray-600 transition-transform hover:scale-110 duration-200 cursor-pointer">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />
          </svg>
        </div>
      );
  }
};

const SaveSuccessPopup = ({ isVisible, onClose, matrixName }: any) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Matrix Saved Successfully!</h3>
          <p className="text-gray-600 mb-4">"{matrixName}" has been saved and is now available.</p>
          <div className="space-y-3">
            <Button onClick={() => { window.open("/skills-mapping", "_blank"); onClose(); }} className="w-full bg-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              View in Skills Mapping
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">Continue Editing</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddEmployeeDialog = ({ isOpen, onClose, onAddEmployee, departmentId, departmentName }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [empId, setEmpId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          departmentId: departmentId,
          experience: "0 years",
          yearsExperience: 0,
          gender: null,
        });
        onClose();
      } else {
        setError(result.message || "Failed to create employee.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Creates a new employee in <strong>{departmentName}</strong>.</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" disabled={saving} />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={saving} />
          <Input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Employee ID (optional)" disabled={saving} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600" disabled={saving || !name.trim() || !email.trim()}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CreateDepartmentDialog = ({ isOpen, onClose, onCreateDepartment }: any) => {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentArea, setDepartmentArea] = useState("");

  const handleCreate = () => {
    if (departmentName.trim() && departmentArea.trim()) {
      onCreateDepartment({ name: departmentName.trim(), area: departmentArea.trim() });
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
          <Input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Department Name" />
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
          <Button onClick={handleCreate} disabled={!departmentName.trim() || !departmentArea.trim()}>Create Department</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NoEmployeesState = ({ departmentName, onAddEmployee }: any) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Employees Found</h3>
      <p className="text-gray-600 mb-6">There are no employees in {departmentName} department yet.</p>
      <Button onClick={onAddEmployee} className="bg-blue-600">Add Employee</Button>
    </div>
  );
};

const SkillsMatrixManager = () => {
  const { userEmployeeId, userEmail } = useUserPermissions();
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
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [skillLevels, setSkillLevels] = useState<{ [key: string]: string }>({});
  const [saved, setSaved] = useState(false);
  const [showFinalTable, setShowFinalTable] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);

  // Database hooks
  const { employees: dbEmployees, loading: employeesLoading, error: employeesError } = useEmployees();
  const { departments: dbDepartments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { matrices, loading: matricesLoading, error: matricesError, saveMatrix, updateMatrix } = useSkillMatrices();
  const { skills: dbSkills, getSkillsByDepartment } = useSkills();

  const [departments, setDepartments] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  // Load departments
  useEffect(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      setDepartments(dbDepartments.map((dept: any) => ({
        id: dept.id || dept._id,
        name: dept.name,
        area: dept.area || "Production",
      })));
    }
  }, [dbDepartments]);

  // Load employees
  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      setAllEmployees(
        dbEmployees.map((emp: any) => ({
          id: emp.id || emp._id || emp.employeeId,
          name: emp.name,
          department: emp.department,
          departmentId: emp.departmentId || emp.department_id,
          experience: `${emp.yearsExperience || 0} years`,
          yearsExperience: emp.yearsExperience || 0,
          gender: emp.gender,
          title: emp.title,
        }))
      );
    }
  }, [dbEmployees]);

  // Get filtered employees based on selected department
  const getFilteredEmployees = () => {
    if (!selectedDepartment) return [];
    return allEmployees.filter((emp) => {
      const isMatch = showAllDepts || emp.departmentId === selectedDepartment;
      return isMatch && emp.name.toLowerCase().includes(employeeFilter.toLowerCase());
    });
  };

  const filteredEmployees = getFilteredEmployees();
  
  const availableEmployees = filteredEmployees.filter(
    (emp) => !selectedEmployees.find((selected) => selected.id === emp.id)
  );

  const departmentSkills = selectedDepartment ? getSkillsByDepartment(selectedDepartment) : [];
  const activePredefinedSkills = showAllSkills ? dbSkills : departmentSkills;
  const availableSkillsAndMachines = activePredefinedSkills.map((skill: any) => ({ name: skill.name, type: "skill" }));
  const filteredSkills = availableSkillsAndMachines.filter(
    (item) => item.name.toLowerCase().includes(skillFilter.toLowerCase()) && !skills.includes(item.name)
  );

  const steps = [
    { id: 1, title: "Matrix Setup", desc: "Name your matrix and select department" },
    { id: 2, title: "Select Employees", desc: "Choose employees for the matrix (rows)" },
    { id: 3, title: "Add Skills", desc: "Define skills (columns)" },
    { id: 4, title: "Preview & Save", desc: "Review and save your matrix" },
  ];

  // Initialize skill levels
  useEffect(() => {
    if (selectedEmployees.length > 0 && skills.length > 0 && !selectedMatrix) {
      const newSkillLevels = {};
      selectedEmployees.forEach((employee) => {
        Object.assign(newSkillLevels, generateSkillLevels(employee, skills));
      });
      setSkillLevels((prev) => ({ ...prev, ...newSkillLevels }));
    }
  }, [selectedEmployees, skills, selectedMatrix]);

  const loadMatrix = (matrix: any, shouldPreview = false) => {
    setMatrixName(matrix.name);
    setSelectedDepartment(matrix.departmentId);
    setSelectedEmployees(matrix.matrixData?.employees || []);
    const matrixSkills = matrix.matrixData?.skills || [];
    const skillStrings = matrixSkills.map((skill: any) => typeof skill === 'object' && skill.name ? skill.name : skill);
    setSkills(skillStrings);
    setSkillLevels(matrix.matrixData?.skillLevels || {});
    setSelectedMatrix(matrix);
    if (shouldPreview) {
      setShowFinalTable(true);
    }
  };

  // Load matrix from URL parameter
  useEffect(() => {
    if (matrixId && matrices && matrices.length > 0) {
      const found = matrices.find((m: any) => (m.id || m._id)?.toString() === matrixId.toString());
      if (found) {
        loadMatrix(found, true);
      }
    }
  }, [matrixId, matrices]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return matrixName.trim() && selectedDepartment;
      case 2: return selectedEmployees.length > 0;
      case 3: return skills.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleAddEmployee = () => setShowAddEmployeeDialog(true);
  const addEmployee = (employee: any) => setSelectedEmployees([...selectedEmployees, employee]);
  const removeEmployee = (employeeId: string) => setSelectedEmployees(selectedEmployees.filter((emp) => emp.id !== employeeId));

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addPredefinedSkill = (skillItem: any) => {
    if (!skills.includes(skillItem.name)) setSkills([...skills, skillItem.name]);
  };

  const removeSkill = (skillToRemove: string) => setSkills(skills.filter((skill) => skill !== skillToRemove));

  const handleSkillChange = (employeeName: string, skill: string, level: string) => {
    setSkillLevels((prev) => ({ ...prev, [`${employeeName}-${skill}`]: level }));
  };

  const getSkillLevel = (employee: any, skill: string) => skillLevels[`${employee.name}-${skill}`] || "None";

  // FIXED handleSave function - using valid database ID
  // FIXED handleSave function - using valid database ID
  const handleSave = async () => {
    const selectedDept = departments.find((d) => d.id === selectedDepartment);
    if (!selectedDept) {
      alert("Please select a valid department.");
      return;
    }
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

    // Check if a matrix with the same name already exists in the database
    const nameExists = matrices.some((m: any) => 
      m.name?.trim().toLowerCase() === matrixName.trim().toLowerCase() && 
      (!selectedMatrix || (m.id || m._id)?.toString() !== (selectedMatrix.id || selectedMatrix._id)?.toString())
    );
    if (nameExists) {
      alert(`A skills matrix with the name "${matrixName}" already exists. Please choose a unique name.`);
      return;
    }

    // Use a valid MANAGER ID from your database
    // This ID (Ayesha Khan) exists in your dawlance_user table
    const employeeId = "69e21baf428a529a50280895";

    const matrixData = {
      name: matrixName.trim(),
      employeeId: employeeId,
      departmentId: selectedDept.id,
      description: `Skills matrix for ${selectedDept.name} department`,
      matrixData: {
        employees: selectedEmployees,
        skills: skills,
        skillLevels: skillLevels,
        employeeCount: selectedEmployees.length,
        skillCount: skills.length,
      },
    };

    const matrixIdToUpdate = selectedMatrix?.id || selectedMatrix?._id;
    const result = matrixIdToUpdate
      ? await updateMatrix(matrixIdToUpdate, matrixData)
      : await saveMatrix(matrixData);

    if (result.success) {
      router.push("/skills-mapping?success=true");
    } else {
      alert(`Failed to save: ${(result as any).error || (result as any).message || "Unknown error"}`);
    }
  };

  // Loading state
  if (employeesLoading || departmentsLoading || matricesLoading) return <DatabaseLoading />;
  if (employeesError || departmentsError || matricesError) {
    return <DatabaseError error={employeesError || departmentsError || matricesError || ""} onRetry={() => window.location.reload()} />;
  }

  if (showFinalTable) {
    // Find department name for display
    const currentDeptName = departments.find(d => d.id === selectedDepartment)?.name || "Department Line";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {matrixName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Active Competency Map • {currentDeptName} • {selectedEmployees.length} Operators • {skills.length} Certified Skills
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinalTable(false)}
                className="h-9 px-4 border border-gray-200 text-gray-700 hover:bg-slate-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-slate-900"
              >
                ← Back to Builder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-9 px-4 border border-gray-200 text-gray-700 hover:bg-slate-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-slate-900 hidden sm:inline-flex"
              >
                Print Matrix
              </Button>
            </div>
          </div>

          {/* Harvey Ball Legend */}
          <div className="flex flex-wrap items-center gap-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Proficiency Key:
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <PieChartSkillIndicator level="None" size={18} />
              <span className="text-gray-600 dark:text-gray-400">0 - None (No Skill)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <PieChartSkillIndicator level="Low" size={18} />
              <span className="text-gray-600 dark:text-gray-400">1 - Low (Supervised Practice)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <PieChartSkillIndicator level="Medium" size={18} />
              <span className="text-gray-600 dark:text-gray-400">2 - Medium (Independent Standard Operations)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <PieChartSkillIndicator level="High" size={18} />
              <span className="text-gray-600 dark:text-gray-400">3 - High (Autonomous Line Handling)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <PieChartSkillIndicator level="Expert" size={18} />
              <span className="text-gray-600 dark:text-gray-400">4 - Expert (Troubleshooting &amp; Coaching)</span>
            </div>
          </div>

          {/* Matrix Card */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
                      {/* Sticky Top-Left corner */}
                      <th className="sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Operator Name
                      </th>
                      {skills.map((skill, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-800 min-w-[120px]"
                        >
                          {skill}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployees.map((emp, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors border-b border-gray-100 dark:border-gray-800"
                      >
                        {/* Sticky Left-aligned employee name cell */}
                        <td className="sticky left-0 bg-white dark:bg-gray-900 z-10 px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] truncate max-w-[200px]">
                          {emp.name}
                        </td>
                        {skills.map((skill, skillIdx) => (
                          <td
                            key={skillIdx}
                            className="px-6 py-4 text-center border-r border-gray-100 dark:border-gray-800/60"
                          >
                            <div className="flex justify-center">
                              <PieChartSkillIndicator level={getSkillLevel(emp, skill)} size={20} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <SaveSuccessPopup isVisible={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} matrixName={matrixName} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Skills Matrix Builder
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Establish a competency mapping layout for line operators in 4 quick steps.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              <div className="flex items-center w-full">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40"
                    : currentStep > step.id
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  }`} />
                )}
              </div>
              <div className="mt-2 text-center hidden md:block">
                <p className={`text-sm font-bold tracking-tight ${currentStep === step.id ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Step 1: Matrix Setup */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Configure Matrix Meta
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Provide a matrix title and select the corresponding plant department line.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-1">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Matrix Builder Mode</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMatrix(null);
                          setMatrixName("");
                          setSelectedDepartment("");
                          setSelectedEmployees([]);
                          setSkills([]);
                          setSkillLevels({});
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                          !selectedMatrix
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50"
                        }`}
                      >
                        Create New
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (matrices && matrices.length > 0) {
                            loadMatrix(matrices[0], false);
                          } else {
                            alert("No existing matrices found to edit.");
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                          selectedMatrix
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-slate-50"
                        }`}
                      >
                        Edit Existing
                      </button>
                    </div>
                  </div>

                  {/* Load Existing dropdown if in edit mode */}
                  {selectedMatrix && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block">Load Saved Matrix</label>
                      <Select
                        value={((selectedMatrix as any).id || (selectedMatrix as any)._id)?.toString()}
                        onValueChange={(val) => {
                          const found = matrices.find(m => (m.id || (m as any)._id)?.toString() === val.toString());
                          if (found) {
                            loadMatrix(found, false);
                          }
                        }}
                      >
                        <SelectTrigger className="h-11 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                          <SelectValue placeholder="Choose saved matrix" />
                        </SelectTrigger>
                        <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-xl max-h-56 overflow-y-auto">
                          {matrices.map((m: any) => (
                            <SelectItem key={m.id || m._id} value={(m.id || m._id)?.toString()} className="text-sm">
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Matrix Name</label>
                    <Input
                      value={matrixName}
                      onChange={(e) => setMatrixName(e.target.value)}
                      placeholder={selectedMatrix ? "Edit matrix name" : "e.g., Welding Line A - Q3 Skill Mapping"}
                      className="h-11 text-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Department Line</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateDepartment(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> New Department
                      </Button>
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-11 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <SelectValue placeholder="Choose department line" />
                      </SelectTrigger>
                      <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-xl">
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id} className="text-sm">
                            {dept.name} ({dept.area})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Employees */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                  <h3 className="font-bold text-sm text-orange-900 dark:text-orange-300 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Table Rows: Operators
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    Select the technicians and line operators to assign as rows in the matrix.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Pane: Available */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Available Operators</h4>
                        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold">{availableEmployees.length}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddEmployee}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold p-1.5 h-auto"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Operator
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={employeeFilter}
                          onChange={(e) => setEmployeeFilter(e.target.value)}
                          placeholder="Filter operators by name..."
                          className="pl-9 h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 px-1 py-1">
                        <input
                          type="checkbox"
                          id="showAllDepts"
                          checked={showAllDepts}
                          onChange={(e) => setShowAllDepts(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-650 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="showAllDepts" className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                          Show operators from all departments
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {availableEmployees.map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-800/60 rounded-xl hover:border-gray-300 transition-all">
                          <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{emp.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{emp.department} • {emp.experience}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addEmployee(emp)}
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-0 flex items-center justify-center shadow-sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {availableEmployees.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 space-y-3">
                          <p className="text-xs text-gray-500 font-medium">No operators found matching criteria</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddEmployee}
                            className="text-xs font-semibold"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Create Operator
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Pane: Selected */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Selected Rows</h4>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">{selectedEmployees.length}</Badge>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {selectedEmployees.map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center p-3 bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{emp.department} • {emp.experience}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeEmployee(emp.id)}
                            className="h-8 w-8 p-0 hover:bg-red-700 rounded-lg flex items-center justify-center border-0 shadow-sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {selectedEmployees.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                          <p className="text-xs text-gray-500 font-medium">No operators assigned to rows yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Add Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <Cog className="h-5 w-5 text-emerald-600" />
                    Table Columns: Skills
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    Select predefined line skills or define custom metrics to map as column headers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Pane: Available */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Available Skills</h4>
                      <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold">{filteredSkills.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={skillFilter}
                          onChange={(e) => setSkillFilter(e.target.value)}
                          placeholder="Search predefined skills..."
                          className="pl-9 h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 px-1 py-1">
                        <input
                          type="checkbox"
                          id="showAllSkills"
                          checked={showAllSkills}
                          onChange={(e) => setShowAllSkills(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-650 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="showAllSkills" className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                          Show skills from all departments
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {filteredSkills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-800/60 rounded-xl hover:border-gray-300 transition-all">
                          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{skill.name}</span>
                          <Button
                            size="sm"
                            onClick={() => addPredefinedSkill(skill)}
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-0 flex items-center justify-center shadow-sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-2">Create Custom Skill</label>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="e.g., Robot Programming"
                          onKeyPress={(e) => e.key === "Enter" && addSkill()}
                          className="h-10 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        />
                        <Button
                          onClick={addSkill}
                          className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center border-0 shadow-md"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Pane: Selected */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Selected Columns</h4>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">{skills.length}</Badge>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{skill}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeSkill(skill)}
                            className="h-8 w-8 p-0 hover:bg-red-700 rounded-lg flex items-center justify-center border-0 shadow-sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {skills.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                          <p className="text-xs text-gray-500 font-medium">No skills mapped to columns yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preview & Save */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                  <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Matrix Summary
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                    Verify department details, columns, rows, and final competency layout before saving.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Metadata</h4>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Name: <span className="font-medium text-gray-600 dark:text-gray-400">{matrixName}</span></p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Department: <span className="font-medium text-gray-600 dark:text-gray-400">{departments.find(d => d.id === selectedDepartment)?.name}</span></p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 space-y-2">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Operators ({selectedEmployees.length})</h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedEmployees.map((emp, idx) => (
                        <p key={idx} className="text-sm font-semibold text-gray-700 dark:text-gray-300">• {emp.name}</p>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Certified Columns ({skills.length})</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {skills.map((skill, idx) => (
                        <p key={idx} className="text-sm font-semibold text-gray-700 dark:text-gray-300">• {skill}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                  <Button
                    onClick={handleSave}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center shadow-md border-0 h-10 px-6 text-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Skills Matrix
                  </Button>
                  <Button
                    onClick={() => setShowFinalTable(true)}
                    variant="outline"
                    className="h-10 px-6 text-sm font-semibold border border-gray-200 hover:bg-slate-50 dark:border-gray-800 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-900"
                  >
                    <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                    Preview Matrix
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                variant="outline"
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider border border-gray-200 hover:bg-slate-50 dark:border-gray-800 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 4 || !canProceedToNext()}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 border-0 shadow-md"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Department Dialog */}
        <CreateDepartmentDialog 
          isOpen={showCreateDepartment} 
          onClose={() => setShowCreateDepartment(false)} 
          onCreateDepartment={async (newDept: any) => {
            try {
              const result = await departmentsService.create(newDept);
              if (result.success && result.data) {
                const newDepartment = {
                  id: result.data.id || result.data._id || Date.now().toString(),
                  name: newDept.name,
                  area: newDept.area,
                };
                setDepartments(prev => [...prev, newDepartment]);
                alert(`Department "${newDept.name}" created successfully!`);
              } else {
                alert(result.message || "Failed to create department");
              }
            } catch (error) {
              console.error("Error creating department:", error);
              alert("Network error. Please try again.");
            }
            setShowCreateDepartment(false);
          }} 
        />
        
        <AddEmployeeDialog 
          isOpen={showAddEmployeeDialog} 
          onClose={() => setShowAddEmployeeDialog(false)} 
          onAddEmployee={(newEmp: any) => {
            setAllEmployees(prev => [...prev, newEmp]);
            setSelectedEmployees(prev => [...prev, newEmp]);
          }} 
          departmentId={selectedDepartment} 
          departmentName={departments.find(d => d.id === selectedDepartment)?.name || "this department"} 
        />
      </div>
    </div>
  );
};

export default function SkillsMatrixPage() {
  return (
    <Suspense fallback={<DatabaseLoading />}>
      <SkillsMatrixManager />
    </Suspense>
  );
}