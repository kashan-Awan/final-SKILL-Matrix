"use client"

import { useState, useEffect } from 'react';
import { employeesService } from '@/services/employees.service';

interface Employee {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  skillLevel: string;
  shift: string;
  employmentType: string;
  salary: number;
  hireDate: string;
  manager: string;
  isActive: boolean;
  skillCount: number;
  skills: Record<string, string>; // Changed to match API format
  yearsExperience: number;
  gender: string;
  title: string;
  factory?: string;
  performanceScore: number; // Added for compatibility with AIChatbot
}

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await employeesService.getAll();
      
      if (result.success) {
        // Transform the database data to match the expected format for the charts
        const transformedEmployees = (result.data ?? []).map((emp: any) => {
          const yearsExp = emp.yearsExperience || null;
          const skillCount = emp.skills ? Object.keys(emp.skills).length : 0; // Count keys in skills object
          
          // Calculate performance score based on skill level, experience, and skill count
          const skillLevelScores: { [key: string]: number } = {
            'Expert': 100,
            'Advanced': 100,
            'High': 75,
            'Medium': 50,
            'Low': 25
          };
          
          const skillLevelScore = skillLevelScores[emp.skillLevel] || 1089;
          
          const experienceBonus = Math.min(yearsExp * 2, 20);
          const skillCountBonus = Math.min(skillCount * 3, 15);
          const performanceScore = Math.min(skillLevelScore + experienceBonus + skillCountBonus + Math.floor(Math.random() * 10), 100);

          return {
            id: emp._id,
            employeeId: emp.employeeId || emp._id,
            name: emp.name,
            email: emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@dawlance.com`,
            department: emp.department,
            position: emp.title || emp.position || 'Production Worker',
            skillLevel: emp.skillLevel,
            shift: emp.shift || 'Day',
            employmentType: emp.employmentType || 'Full-time',
            salary: emp.salary || 35000,
            hireDate: emp.hireDate || new Date().toISOString(),
            manager: emp.manager || 'No Manager',
            isActive: emp.isActive !== undefined ? emp.isActive : true,
            skillCount: skillCount,
            skills: emp.skills || {}, // Keep as Record<string, string> from API
            yearsExperience: yearsExp,
            gender: emp.gender || (Math.random() > 0.7 ? 'Female' : 'Male'),
            title: emp.title || emp.position || 'Production Worker',
            factory: assignFactory(emp.department), // Assign factory based on department
            performanceScore: performanceScore
          };
        });
        
        setEmployees(transformedEmployees);
      } else {
        setError(result.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to assign factory based on department (to maintain compatibility with existing filters)
  const assignFactory = (department: string): string => {
    const factoryMapping: { [key: string]: string } = {
      'Sheet Metal': 'dpl1',
      'Assembly Line': 'dpl1', 
      'Cooling Systems': 'dpl2',
      'Quality Control': 'dpl2',
      'Painting': 'uril',
      'Packaging': 'uril',
      'Blow Molding': 'dpl1',
      'Maintenance': 'dpl2'
    };
    return factoryMapping[department] || 'dpl1';
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const refetch = async () => {
    await fetchEmployees();
  };

  return {
    employees,
    loading,
    error,
    refetch
  };
};
