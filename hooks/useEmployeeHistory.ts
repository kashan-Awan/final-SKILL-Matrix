import { useState, useEffect } from 'react';

export interface EmployeeHistoryRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  employeeSkillLevel: string;
  employeeYearsExperience: number;
  departmentName: string;
  machineName: string;
  machineType: string;
  skillName: string;
  skillCategory: string;
  workDate: string;
  hoursWorked: number;
  productivity: number;
  qualityScore: number;
  notes?: string;
  shift: string;
  createdAt: string;
}

export interface EmployeePerformanceMetric {
  _id: string;
  employeeName: string;
  employeeTitle: string;
  employeeSkillLevel: string;
  employeeYearsExperience: number;
  departmentName: string;
  totalHours: number;
  avgProductivity: number;
  avgQualityScore: number;
  workDays: number;
  maxProductivity: number;
  minProductivity: number;
  maxQualityScore: number;
  minQualityScore: number;
  consistency: number;
  skillVersatility: number;
  machineVersatility: number;
  overallScore: number;
  recentWorkDates: string[];
  skills: string[];
  machines: string[];
}

export interface EmployeeHistoryResponse {
  success: boolean;
  data: {
    history: EmployeeHistoryRecord[];
    performanceMetrics: EmployeePerformanceMetric[];
    summary: {
      totalRecords: number;
      dateRange: {
        from: string;
        to: string;
      };
      uniqueEmployees: number;
    };
  };
}

interface UseEmployeeHistoryOptions {
  employeeId?: string;
  department?: string;
  days?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useEmployeeHistory = (options: UseEmployeeHistoryOptions = {}) => {
  const [data, setData] = useState<EmployeeHistoryResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeHistory = async (fetchOptions?: UseEmployeeHistoryOptions) => {
    const finalOptions = { ...options, ...fetchOptions };
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (finalOptions.employeeId) {
        params.append('employeeId', finalOptions.employeeId);
      }
      if (finalOptions.department) {
        params.append('department', finalOptions.department);
      }
      if (finalOptions.days) {
        params.append('days', finalOptions.days.toString());
      }
      if (finalOptions.limit) {
        params.append('limit', finalOptions.limit.toString());
      }

      const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${BACKEND}/work-history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EmployeeHistoryResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('Failed to fetch employee history');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching employee history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchEmployeeHistory();
    }
  }, [options.employeeId, options.department, options.days, options.limit]);

  const getTopPerformers = (department?: string, limit = 5) => {
    if (!data?.performanceMetrics) return [];
    
    let metrics = data.performanceMetrics;
    
    if (department) {
      metrics = metrics.filter(metric => 
        metric.departmentName.toLowerCase().includes(department.toLowerCase())
      );
    }
    
    return metrics
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  };

  const getEmployeeInsights = (employeeId: string) => {
    if (!data?.performanceMetrics) return null;
    
    return data.performanceMetrics.find(metric => metric._id === employeeId);
  };

  const getDepartmentAverages = (department: string) => {
    if (!data?.performanceMetrics) return null;
    
    const deptMetrics = data.performanceMetrics.filter(metric =>
      metric.departmentName.toLowerCase().includes(department.toLowerCase())
    );
    
    if (deptMetrics.length === 0) return null;
    
    const totals = deptMetrics.reduce((acc, metric) => ({
      productivity: acc.productivity + metric.avgProductivity,
      quality: acc.quality + metric.avgQualityScore,
      consistency: acc.consistency + metric.consistency,
      overallScore: acc.overallScore + metric.overallScore
    }), { productivity: 0, quality: 0, consistency: 0, overallScore: 0 });
    
    const count = deptMetrics.length;
    
    return {
      avgProductivity: totals.productivity / count,
      avgQuality: totals.quality / count,
      avgConsistency: totals.consistency / count,
      avgOverallScore: totals.overallScore / count,
      employeeCount: count
    };
  };

  return {
    data,
    loading,
    error,
    fetchEmployeeHistory,
    getTopPerformers,
    getEmployeeInsights,
    getDepartmentAverages,
    refetch: () => fetchEmployeeHistory()
  };
};
