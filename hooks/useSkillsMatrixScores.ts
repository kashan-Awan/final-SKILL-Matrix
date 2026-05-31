"use client"

import { useState, useEffect, useCallback } from 'react';

interface SkillDistribution {
  Low: number;
  Medium: number;
  High: number;
  Advanced: number;
  Expert: number;
}

interface MachineScore {
  id: string;
  name: string;
  type: string;
  operatorCount: number;
  averageSkillLevel: number;
  skillDistribution: SkillDistribution;
}

interface DepartmentScore {
  id: string;
  name: string;
  employeeCount: number;
  averageScore: number;
  skillBreakdown: SkillDistribution;
}

interface SkillsMatrixData {
  department: DepartmentScore;
  machines: MachineScore[];
}

export function useSkillsMatrixScores(departmentId?: string) {
  const [data, setData] = useState<SkillsMatrixData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = departmentId 
        ? `${BACKEND}/dashboard/machine-scores?departmentId=${departmentId}`
        : `${BACKEND}/dashboard/machine-scores`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch skills matrix data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
