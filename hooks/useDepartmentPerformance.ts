import { useState, useEffect } from 'react';

interface DepartmentPerformanceData {
  month: string;
  target: number;
  [departmentName: string]: number | string;
}

interface UseDepartmentPerformanceReturn {
  performanceData: DepartmentPerformanceData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  calculateAndRefetch: () => void;
}

// ✅ ADDED: Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('adminToken');
};

export function useDepartmentPerformance(year?: number): UseDepartmentPerformanceReturn {
  const [performanceData, setPerformanceData] = useState<DepartmentPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = year || new Date().getFullYear();

  const fetchPerformanceData = async (calculate = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        year: currentYear.toString(),
        ...(calculate && { calculate: 'true' })
      });

      const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // ✅ ADDED: Get the token
      const token = getToken();
      
      // ✅ CHANGED: Added headers with Authorization
      const response = await fetch(`${BACKEND}/dashboard/department-performance?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPerformanceData(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch department performance data');
      }
    } catch (err) {
      console.error('Error fetching department performance:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPerformanceData(false);
  };

  const calculateAndRefetch = () => {
    fetchPerformanceData(true);
  };

  useEffect(() => {
    fetchPerformanceData(false);
  }, [currentYear]);

  return {
    performanceData,
    loading,
    error,
    refetch,
    calculateAndRefetch
  };
}