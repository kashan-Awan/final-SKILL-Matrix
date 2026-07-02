"use client"

import { useState, useEffect } from 'react';
import { skillMatrixService } from '@/services/skill-matrix.service';

interface SkillMatrix {
  id: string;
  name: string;
  employeeId: string;
  description: string;
  department?: string;
  departmentName?: string;
  departmentId: string;
  matrixData: {
    employees: any[];
    skills: string[];
    skillLevels: { [key: string]: string };
    employeeCount: number;
    skillCount: number;
    skillProperties?: any[];
  };
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeeCount?: number;
  skillCount?: number;
}

interface UseSkillMatricesReturn {
  matrices: SkillMatrix[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveMatrix: (matrixData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateMatrix: (id: string, matrixData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteMatrix: (id: string) => Promise<boolean>;
  getMatrixById: (id: string) => Promise<SkillMatrix | null>;
}

export const useSkillMatrices = (departmentId?: string): UseSkillMatricesReturn => {
  const [matrices, setMatrices] = useState<SkillMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = departmentId && departmentId !== 'all'
        ? await skillMatrixService.getByDepartment(departmentId)
        : await skillMatrixService.getAll();
      // console.log("Fetched skill matrices:", result);
      if (result.success) {
        // Transform snake_case API response to camelCase for UI consistency
        const transformed = (result.data ?? []).map((m: any) => ({
          ...m,
          id: m._id ?? m.id,
          departmentId: m.department_id ?? m.departmentId,
          departmentName: m.departmentName,
          department: m.departmentName,
          employeeId: m.employee_id ?? m.employeeId,
          matrixData: typeof m.matrix_data === 'string'
            ? JSON.parse(m.matrix_data)
            : (m.matrix_data ?? m.matrixData ?? {}),
          isActive: m.is_active ?? m.isActive,
          createdAt: m.created_at ?? m.createdAt,
          updatedAt: m.updated_at ?? m.updatedAt,
        }));
        setMatrices(transformed);
      } else {
        setError(result.message || 'Failed to fetch skill matrices');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching skill matrices:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMatrix = async (matrixData: any): Promise<any> => {
    try {
      // Send camelCase keys that the backend controller expects
      const payload = {
        name: matrixData.name,
        departmentId: matrixData.departmentId ?? matrixData.department_id,
        employeeId: matrixData.employeeId ?? matrixData.employee_id,
        description: matrixData.description,
        matrixData: matrixData.matrixData ?? matrixData.matrix_data,
        version: matrixData.version || '1.0',
        createdBy: matrixData.employeeId ?? matrixData.employee_id,
      };

      const result = await skillMatrixService.create(payload);

      if (result.success) {
        await fetchMatrices(); // Refresh the list
        return {
          success: true,
          data: result.data
        };
      } else {
        const errMsg = result.error || result.message || 'Failed to save skill matrix';
        return {
          success: false,
          error: errMsg
        };
      }
    } catch (err: any) {
      console.error('Error saving skill matrix:', err);
      return {
        success: false,
        error: err.message || 'Network error occurred while saving'
      };
    }
  };

  const updateMatrix = async (id: string, matrixData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // Transform camelCase to snake_case for API
      const payload: any = { id };
      if (matrixData.name !== undefined) payload.name = matrixData.name;
      if (matrixData.description !== undefined) payload.description = matrixData.description;
      if (matrixData.version !== undefined) payload.version = matrixData.version;
      payload.matrixData = matrixData.matrixData ?? matrixData.matrix_data;
      payload.isActive = matrixData.isActive ?? matrixData.is_active ?? true;

      const result = await skillMatrixService.update(id, payload);

      if (result.success) {
        await fetchMatrices(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        const errMsg = result.error || result.message || 'Failed to update skill matrix';
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      console.error('Error updating skill matrix:', err);
      return { success: false, error: err.message || 'Network error occurred while updating' };
    }
  };

  const deleteMatrix = async (id: string): Promise<boolean> => {
    try {
      const result = await skillMatrixService.delete(id);

      if (result.success) {
        await fetchMatrices(); // Refresh the list
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error deleting skill matrix:', err);
      return false;
    }
  };

  const getMatrixById = async (id: string): Promise<SkillMatrix | null> => {
    try {
      const result = await skillMatrixService.getById(id);

      if (result.success) {
        return result.data as unknown as SkillMatrix;
      } else {
        setError(result.error || 'Failed to fetch skill matrix');
        return null;
      }
    } catch (err) {
      setError('Network error occurred while fetching matrix');
      console.error('Error fetching skill matrix:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, [departmentId]);

  const refetch = async () => {
    await fetchMatrices();
  };

  return {
    matrices,
    loading,
    error,
    refetch,
    saveMatrix,
    updateMatrix,
    deleteMatrix,
    getMatrixById
  };
};
