

// Database service functions (MySQL stubs)
import pool from './mysql';

export const DatabaseService = {
  // Get all employees with their department and skills (MySQL version)
  async getEmployeesWithDetails() {
    const [rows] = await pool.query(
      `WITH EmployeeSkillAggregates AS (
        SELECT
          es.employee_id,
          COUNT(es.id) as skillCount,
          AVG(
            CASE LOWER(es.level)
              WHEN 'low' THEN 1.0
              WHEN 'medium' THEN 2.0
              WHEN 'high' THEN 3.0
              WHEN 'expert' THEN 4.0
              WHEN 'advanced' THEN 5.0
              ELSE 0.0
            END
          ) as averageSkillLevel
        FROM employee_skills es
        WHERE es.is_deleted = 0
        GROUP BY es.employee_id
      )
      SELECT
        e.*,
        d.name as department,
        COALESCE(esa.skillCount, 0) as skillCount,
        COALESCE(esa.averageSkillLevel, 0) as averageSkillLevel
      FROM dawlance_user e
      LEFT JOIN departments d ON e.departmentId = d.id
      LEFT JOIN EmployeeSkillAggregates esa ON e._id = esa.employee_id
      WHERE e.is_deleted = 0`
    );
    return rows;
  },

  // Get department performance metrics (MySQL version)
  async getDepartmentMetrics() {
    const [rows] = await pool.query(
      `SELECT 
        d.*, 
        (SELECT COUNT(*) FROM dawlance_user e WHERE e.departmentId = d.id AND e.is_deleted = 0) as employeeCount, 
        metrics.averageProductivity, 
        metrics.averageQualityScore, 
        metrics.totalHoursWorked
      FROM departments d
      LEFT JOIN (
        SELECT 
          departmentId, 
          AVG(CAST(productivity AS FLOAT)) as averageProductivity, 
          AVG(CAST(qualityScore AS FLOAT)) as averageQualityScore, 
          SUM(hoursWorked) as totalHoursWorked
        FROM employee_work_history
        WHERE is_deleted = 0
        GROUP BY departmentId
      ) as metrics ON d.id = metrics.departmentId
      WHERE d.is_deleted = 0`
    );
    return rows;
  },

  // Get skill matrix for a department (MySQL version)
  async getSkillMatrixByDepartment(departmentId: string) {
    const [rows] = await pool.query(
      `SELECT sm.*, d.name as department
      FROM skill_matrix sm
      LEFT JOIN departments d ON sm.departmentId = d.id
      WHERE sm.departmentId = ? AND sm.is_deleted = 0 AND sm.isActive = 1`,
      [departmentId]
    );
    return rows;
  }
};

export default DatabaseService;
