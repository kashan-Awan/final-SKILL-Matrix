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

const PieChartSkillIndicator = ({ level, size = 80 }: { level: string; size?: number }) => {
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
  const [skillFilter, setSkillFilter] = useState("");
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
  const { matrices, loading: matricesLoading, error: matricesError, saveMatrix } = useSkillMatrices();
  const { getSkillsByDepartment } = useSkills();

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
      const isMatch = emp.departmentId === selectedDepartment;
      return isMatch && emp.name.toLowerCase().includes(employeeFilter.toLowerCase());
    });
  };

  const filteredEmployees = getFilteredEmployees();
  
  const availableEmployees = filteredEmployees.filter(
    (emp) => !selectedEmployees.find((selected) => selected.id === emp.id)
  );

  const departmentSkills = selectedDepartment ? getSkillsByDepartment(selectedDepartment) : [];
  const availableSkillsAndMachines = departmentSkills.map((skill: any) => ({ name: skill.name, type: "skill" }));
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

  const loadMatrix = (matrix: any) => {
    setMatrixName(matrix.name);
    setSelectedDepartment(matrix.departmentId);
    setSelectedEmployees(matrix.matrixData?.employees || []);
    const matrixSkills = matrix.matrixData?.skills || [];
    const skillStrings = matrixSkills.map((skill: any) => typeof skill === 'object' && skill.name ? skill.name : skill);
    setSkills(skillStrings);
    setSkillLevels(matrix.matrixData?.skillLevels || {});
    setSelectedMatrix(matrix);
    setShowFinalTable(true);
  };

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

    const result = await saveMatrix(matrixData);
    if (result.success) {
      setSaved(true);
      setShowSuccessPopup(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(`Failed to save: ${result.error}`);
    }
  };

  // Loading state
  if (employeesLoading || departmentsLoading || matricesLoading) return <DatabaseLoading />;
  if (employeesError || departmentsError || matricesError) {
    return <DatabaseError error={employeesError || departmentsError || matricesError || ""} onRetry={() => window.location.reload()} />;
  }

  if (showFinalTable) {
    return (
      <div className="min-h-screen bg-white p-6">
        <Button onClick={() => setShowFinalTable(false)} className="mb-4">← Back to Builder</Button>
        <Card>
          <CardHeader>
            <CardTitle>{matrixName}</CardTitle>
            <CardDescription>{selectedEmployees.length} employees • {skills.length} skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    {skills.map((skill, idx) => (<TableHead key={idx}>{skill}</TableHead>))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployees.map((emp, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      {skills.map((skill, skillIdx) => (
                        <TableCell key={skillIdx}>
                          <PieChartSkillIndicator level={getSkillLevel(emp, skill)} size={40} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <SaveSuccessPopup isVisible={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} matrixName={matrixName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">Skills Matrix Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage employee skill matrices</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                {step.id}
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Matrix Setup */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Matrix Name</label>
                  <Input value={matrixName} onChange={(e) => setMatrixName(e.target.value)} placeholder="Enter matrix name" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Department</label>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateDepartment(true)}><Plus className="h-4 w-4 mr-1" /> New Department</Button>
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name} ({dept.area})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Select Employees */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2"><User className="h-5 w-5" /> Table Rows: Employees</h3>
                  <p className="text-sm text-orange-800">Each employee you select will become a row in your matrix.</p>
                </div>

                {filteredEmployees.length === 0 && selectedDepartment ? (
                  <NoEmployeesState departmentName={departments.find(d => d.id === selectedDepartment)?.name || "selected"} onAddEmployee={handleAddEmployee} />
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Available Employees</h3>
                        <Badge>{availableEmployees.length}</Badge>
                      </div>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} placeholder="Search employees..." className="pl-10" />
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableEmployees.map((emp) => (
                          <div key={emp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.department} • {emp.experience}</p>
                            </div>
                            <Button size="sm" onClick={() => addEmployee(emp)} className="bg-green-600"><Plus className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Selected Employees</h3>
                        <Badge>{selectedEmployees.length}</Badge>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedEmployees.map((emp) => (
                          <div key={emp.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.department} • {emp.experience}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => removeEmployee(emp.id)}><X className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        {selectedEmployees.length === 0 && <p className="text-center text-gray-500 py-8">No employees selected yet</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Add Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2"><Cog className="h-5 w-5" /> Table Columns: Skills</h3>
                  <p className="text-sm text-blue-800">Each skill will become a column in your matrix.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Available Skills</h3>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} placeholder="Search skills..." className="pl-10" />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSkills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>{skill.name}</span>
                          <Button size="sm" onClick={() => addPredefinedSkill(skill)} className="bg-green-600"><Plus className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Custom skill name" onKeyPress={(e) => e.key === "Enter" && addSkill()} />
                        <Button onClick={addSkill} className="bg-gradient-to-r from-orange-500 to-blue-500"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Selected Skills</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span>{skill}</span>
                          <Button size="sm" variant="destructive" onClick={() => removeSkill(skill)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {skills.length === 0 && <p className="text-center text-gray-500 py-8">No skills selected yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preview & Save */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Matrix Summary</h3>
                  <p className="text-sm text-purple-800">Review your matrix before saving.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">Matrix Details</h4>
                    <p className="text-sm text-gray-600">Name: {matrixName}</p>
                    <p className="text-sm text-gray-600">Department: {departments.find(d => d.id === selectedDepartment)?.name}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">Employees ({selectedEmployees.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedEmployees.map((emp, idx) => <p key={idx} className="text-sm text-gray-600">• {emp.name}</p>)}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">Skills ({skills.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {skills.map((skill, idx) => <p key={idx} className="text-sm text-gray-600">• {skill}</p>)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Skills Matrix
                  </Button>
                  <Button onClick={() => setShowFinalTable(true)} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Preview Table
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={currentStep === 4 || !canProceedToNext()} className="bg-gradient-to-r from-orange-500 to-blue-500">
                Next <ArrowRight className="h-4 w-4 ml-2" />
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