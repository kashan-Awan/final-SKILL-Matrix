

// Database service functions (MySQL stubs)
import pool from './mysql';

export const DatabaseService = {
  // Get all employees with their department and skills (MySQL version)
  async getEmployeesWithDetails() {
    const [rows] = await pool.query(
      `SELECT e.*, d.name as department, COUNT(es.id) as skillCount, AVG(
        CASE LOWER(es.level)
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          WHEN 'expert' THEN 4
          WHEN 'advanced' THEN 5
          ELSE 0
        END
      ) as averageSkillLevel
      FROM employees e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN employeeskills es ON e.id = es.employee_id AND es.is_deleted = 0
      WHERE e.is_deleted = 0
      GROUP BY e.id`
    );
    return rows;
  },

  // Get department performance metrics (MySQL version)
  async getDepartmentMetrics() {
    const [rows] = await pool.query(
      `SELECT d.*, COUNT(e.id) as employeeCount, AVG(ewh.productivity) as averageProductivity, AVG(ewh.quality_score) as averageQualityScore, SUM(ewh.hours_worked) as totalHoursWorked
      FROM departments d
      LEFT JOIN employees e ON d.id = e.departmentId AND e.is_deleted = 0
      LEFT JOIN employee_work_history ewh ON d.id = ewh.department_id AND ewh.is_deleted = 0
      WHERE d.is_deleted = 0
      GROUP BY d.id`
    );
    return rows;
  },

  // Get skill matrix for a department (MySQL version)
  async getSkillMatrixByDepartment(departmentId: string) {
    const [rows] = await pool.query(
      `SELECT sm.*, d.name as department
      FROM skill_matrices sm
      LEFT JOIN departments d ON sm.department_id = d.id
      WHERE sm.department_id = ? AND sm.is_deleted = 0 AND sm.is_active = 1`,
      [departmentId]
    );
    return rows;
  }
};

export default DatabaseService;
