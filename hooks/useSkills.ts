import { useState, useEffect } from 'react';
import { skillsService } from '@/services/skills.service';

interface Skill {
  id: string;
  name: string;
  category: string;
  is_machine_related?: boolean;
  is_critical?: boolean;
  female_eligible?: boolean;
  department_id?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseSkillsReturn {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getSkillsByDepartment: (departmentId: string) => Skill[];
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await skillsService.getAll();
      
      if (data.success) {
        setSkills((data.data || []) as any);
      } else {
        throw new Error(data.error || 'Failed to fetch skills');
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const getSkillsByDepartment = (departmentId: string): Skill[] => {
    return skills.filter(skill => (skill.department_id ?? skill.departmentId) === departmentId);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skills,
    loading,
    error,
    refetch: fetchSkills,
    getSkillsByDepartment
  };
}
