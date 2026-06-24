"use client";

import { useState, useEffect } from "react";
import { 
  User, Phone, Calendar, Briefcase, MapPin, Clock, Wrench, Edit2, Save, X,
  Target, Trophy, Star, TrendingUp, Building2, Users, Award, Factory, 
  IdCard, Smartphone, CheckCircle, LogOut, Mail, CalendarDays, AlertCircle,
  Activity, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  displayId: string;
  department: string;
  departmentId: string;
  phone: string;
  gender: string;
  title: string;
  yearsExperience: number;
  hireDate: string;
  role: string;
  isActive: boolean;
  skills: Record<string, string>;
  totalSkills: number;
}

interface ProfileUserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  employeeId?: string;
  displayId?: string;
  department?: string;
  departmentId?: string;
  phone?: string;
  gender?: string;
  title?: string;
  yearsExperience?: number;
  hireDate?: string;
  role?: string;
  isActive?: boolean;
  skills?: Record<string, string>;
}

interface Skill {
  id: number;
  skillName: string;
  level: string;
  proficiency: number;
  category: string;
}

interface Machine {
  id: string;
  name: string;
  machineId: string;
  type: string;
  status: string;
  location: string;
  supervisorName: string;
  supervisorPhone: string;
}

interface Shift {
  type: string;
  startTime: string;
  endTime: string;
  days: string;
  supervisorName: string;
  hoursWorked?: number;
  productivity?: number;
  qualityScore?: number;
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    phone: "",
    gender: "",
    title: "",
    yearsExperience: ""
  });





  useEffect(() => {

    fetchEmployeeData();
  }, []);

  const getProficiencyValue = (level: string): number => {
    switch (level?.toLowerCase()) {
      case 'expert': return 90;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);


      const profileData = await api.get('/users/profile');



      if (profileData.success && profileData.data) {
        const userData = profileData.data as ProfileUserData;
        
        console.log('isActive from API:', userData.isActive);

        const employeeData: EmployeeData = {
          id: userData._id || userData.id || '',
          name: userData.name,
          email: userData.email,
          employeeId: userData.employeeId || userData._id?.slice(-8) || userData.id?.slice(-8) || '',
          displayId: userData.displayId || userData.employeeId || userData._id?.slice(-8) || userData.id?.slice(-8) || '',
          department: userData.department || "N/A",
          departmentId: userData.departmentId || '',
          phone: userData.phone || "",
          gender: userData.gender || "",
          title: userData.title || "",
          yearsExperience: userData.yearsExperience ?? 0,
          hireDate: userData.hireDate || '',
          role: userData.role || '',
          isActive: userData.isActive ?? true,
          skills: userData.skills || {},
          totalSkills: Object.keys(userData.skills || {}).length
        };
        
        setEmployee(employeeData);
        setEditForm({
          phone: employeeData.phone,
          gender: employeeData.gender,
          title: employeeData.title,
          yearsExperience: employeeData.yearsExperience.toString()
        });
        
        const skillsList = Object.entries(employeeData.skills || {}).map(([name, level], index) => ({
          id: index,
          skillName: name,
          level: level as string,
          proficiency: getProficiencyValue(level as string),
          category: "Technical"
        }));
        setSkills(skillsList);
      } else {
        setError(profileData.message || 'Failed to load profile');
      }

      try {
        const machinesData = await api.get('/users/machines');
        if (machinesData.success) {
          setMachines((machinesData.data as Machine[]) || []);
        }
      } catch (err) {
        console.log('Machines API not available yet');
      }

      try {
        const shiftData = await api.get('/users/shift');
        if (shiftData.success && shiftData.data) {
          setShift(shiftData.data as Shift);
        } else {
          setShift({
            type: "Day Shift",
            startTime: "09:00 AM",
            endTime: "06:00 PM",
            days: "Monday - Friday",
            supervisorName: "Production Manager",
            hoursWorked: 8,
            productivity: 85
          });
        }
      } catch (err) {
        setShift({
          type: "Day Shift",
          startTime: "09:00 AM",
          endTime: "06:00 PM",
          days: "Monday - Friday",
          supervisorName: "Production Manager",
          hoursWorked: 8,
          productivity: 85
        });
      }

    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {

      const data = await api.put('/users/profile', {
        phone: editForm.phone,
        gender: editForm.gender,
        title: editForm.title,
        yearsExperience: parseInt(editForm.yearsExperience) || 0
      });
      if (data.success) {
        setIsEditing(false);
        await fetchEmployeeData();
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userSession');
    window.location.href = '/login';
  };

  const getProficiencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'bg-purple-600';
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProficiencyTextColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'high': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A8A] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error || 'Unable to load employee data'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
              <Button variant="outline" onClick={fetchEmployeeData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {employee.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] p-6 text-center relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                </div>
                <div className="w-28 h-28 rounded-full mx-auto bg-white/10 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-4xl font-bold text-white">
                    {employee.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{employee.name}</h2>
                <p className="text-blue-100 text-sm">{employee.role || 'Employee'}</p>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">Department</span>
                  </div>
                  <span className="font-semibold text-gray-800">{employee.department}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">Employee ID</span>
                  </div>
                  <span className="font-semibold text-gray-800 font-mono">{employee.displayId || employee.employeeId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">Email</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm truncate">{employee.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">Hire Date</span>
                  </div>
                  <span className="font-semibold text-gray-800">{formatDate(employee.hireDate)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">Performance</span>
                  </div>
                  <span className="font-semibold text-gray-400">Under Review</span>
                </div>
              </CardContent>
            </Card>

            {/* Editable Details Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-[#1E3A8A]" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>View and update your details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit2 className="h-4 w-4 mr-1" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm flex-1">Phone:</span>
                      <span className="font-medium text-gray-800">{employee.phone || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm flex-1">Gender:</span>
                      <span className="font-medium text-gray-800">{employee.gender || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm flex-1">Job Title:</span>
                      <span className="font-medium text-gray-800">{employee.title || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm flex-1">Years Experience:</span>
                      <span className="font-medium text-gray-800">{employee.yearsExperience || 0} years</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                        placeholder="Enter phone number" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select 
                        id="gender"
                        aria-label="Gender"
                        value={editForm.gender} 
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input 
                        value={editForm.title} 
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                        placeholder="e.g., Senior Technician" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input 
                        type="number" 
                        value={editForm.yearsExperience} 
                        onChange={(e) => setEditForm({...editForm, yearsExperience: e.target.value})} 
                        placeholder="Years" 
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#1E3A8A]">
                      {saving ? 'Saving...' : 'Save Changes'} <Save className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills, Machines, Shift */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="h-6 w-6 text-[#1E3A8A]" />
                      Skills Performance
                    </CardTitle>
                    <CardDescription>Your skill proficiency levels and ratings</CardDescription>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 px-3 py-1">
                    {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {skills.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No skills assigned yet</p>
                    <p className="text-sm text-gray-400 mt-1">Skills will appear here once assigned by your supervisor</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {skills.map((skill) => (
                      <div key={skill.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getProficiencyColor(skill.level)}`} />
                            <span className="font-semibold text-gray-800 text-lg">{skill.skillName}</span>
                            {skill.level === 'Expert' && <Trophy className="h-5 w-5 text-yellow-500" />}
                            {skill.level === 'High' && <Star className="h-5 w-5 text-green-500" />}
                          </div>
                          <Badge className={getProficiencyTextColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                        <Progress value={skill.proficiency} className="h-2" />
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-gray-500">Proficiency Score</span>
                          <span className="font-semibold text-gray-700">{skill.proficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Machines Section */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-6 w-6 text-[#1E3A8A]" />
                  Assigned Machines
                </CardTitle>
                <CardDescription>Machines you are currently responsible for</CardDescription>
              </CardHeader>
              <CardContent>
                {machines.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No machines assigned yet</p>
                    <p className="text-sm text-gray-400 mt-1">Machine assignments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {machines.map((machine) => (
                      <div key={machine.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">{machine.name}</h4>
                            <p className="text-sm text-gray-500 font-mono mt-1">ID: {machine.machineId}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {machine.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{machine.location || 'Production Floor'}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 text-sm">Supervisor:</span>
                              <span className="font-semibold text-gray-800">{machine.supervisorName || 'Not assigned'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 text-sm">Contact:</span>
                              <span className="font-medium text-gray-800">{machine.supervisorPhone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shift Information Section */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-6 w-6 text-[#1E3A8A]" />
                  Current Shift Schedule
                </CardTitle>
                <CardDescription>Your work schedule and supervisor information</CardDescription>
              </CardHeader>
              <CardContent>
                {!shift ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No shift assigned yet</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift Type</p>
                        <p className="font-bold text-gray-800 text-lg mt-1">{shift.type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timing</p>
                        <p className="font-semibold text-gray-800 mt-1">{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Days</p>
                        <p className="font-semibold text-gray-800 mt-1">{shift.days}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supervisor</p>
                        <p className="font-semibold text-gray-800 mt-1">{shift.supervisorName}</p>
                      </div>
                    </div>
                    {shift.hoursWorked && (
                      <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Hours Worked</p>
                          <p className="font-semibold text-gray-700">{shift.hoursWorked} hrs/day</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Productivity</p>
                          <p className="font-semibold text-gray-700">{shift.productivity}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Summary Card */}
            <Card className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Overall Performance Rating
                    </p>
                    <p className="text-3xl font-bold">Under Review</p>
                    <p className="text-blue-100 text-xs mt-3">Next performance review: Quarterly</p>
                  </div>
                  <div className="bg-white/10 rounded-full p-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}