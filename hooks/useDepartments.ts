"use client"

import { useState, useEffect } from 'react';
import { departmentsService } from '@/services/departments.service';

interface Department {
  id: string;
  name: string;
  area: string;
  description?: string;
  headOfDepartment?: string;
  employeeCount: number;
}

interface UseDepartmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDepartments = (): UseDepartmentsReturn => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await departmentsService.getAll();
      
      if (result.success) {
        setDepartments((result.data || []) as any);
      } else {
        setError(result.error || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('An error occurred while fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const refetch = async () => {
    await fetchDepartments();
  };

  return {
    departments,
    loading,
    error,
    refetch
  };
};
