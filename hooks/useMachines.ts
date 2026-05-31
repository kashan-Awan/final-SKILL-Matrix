"use client"

import { useState, useEffect } from 'react';
import { machinesService } from '@/services/machines.service';

interface Machine {
  _id: string;
  name: string;
  machineId: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  specifications?: any;
  department?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseMachinesReturn {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMachinesByDepartment: (departmentId: string) => Machine[];
}

export function useMachines(): UseMachinesReturn {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await machinesService.getAll();

      if (data.success) {
        setMachines((data.data as unknown as Machine[]) || []);
      } else {
        throw new Error(data.error || 'Failed to fetch machines');
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  const getMachinesByDepartment = (departmentId: string): Machine[] => {
    return machines.filter(machine => machine.departmentId === departmentId);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return {
    machines,
    loading,
    error,
    refetch: fetchMachines,
    getMachinesByDepartment
  };
}

