-- ============================================================
-- Dawlance Skills Matrix - MySQL Setup Script
-- Run this entire file in MySQL Workbench or mysql CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS dawlance_skills_matrix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dawlance_skills_matrix;

-- -------------------------------------------------------
-- 1. departments
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- -------------------------------------------------------
-- 2. managers
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS managers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departmentId INT NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    employee_id VARCHAR(255) NOT NULL UNIQUE,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- -------------------------------------------------------
-- 3. employees
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employeeId VARCHAR(255) NOT NULL UNIQUE,
    departmentId INT,
    gender ENUM('Male','Female') NOT NULL,
    title VARCHAR(255) DEFAULT '',
    email VARCHAR(255),
    phone VARCHAR(50) DEFAULT '',
    date_of_birth DATE,
    hire_date DATE,
    skillLevel VARCHAR(20) DEFAULT 'Low',
    years_experience INT DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- -------------------------------------------------------
-- 4. useraccount
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS useraccount (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role ENUM('admin','manager','user') DEFAULT 'user',
    employee_id INT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- -------------------------------------------------------
-- 5. skills
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    category ENUM('MACHINE','LABOUR','TECHNICAL','SAFETY') NOT NULL,
    is_machine_related TINYINT(1) DEFAULT 0,
    is_critical TINYINT(1) DEFAULT 0,
    female_eligible TINYINT(1) DEFAULT 1,
    department_id INT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- -------------------------------------------------------
-- 6. machines
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    machine_id VARCHAR(255) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) DEFAULT '',
    model VARCHAR(255) DEFAULT '',
    status ENUM('ACTIVE','MAINTENANCE','INACTIVE') DEFAULT 'ACTIVE',
    install_date DATE,
    last_maintenance_date DATE,
    specifications JSON DEFAULT (JSON_OBJECT()),
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- -------------------------------------------------------
-- 7. employeeskills
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS employeeskills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    level ENUM('None','Low','Medium','High','Expert') NOT NULL DEFAULT 'None',
    acquired_date DATE,
    last_assessed_date DATE,
    certification_date DATE,
    notes TEXT DEFAULT '',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    UNIQUE KEY uq_employee_skill (employee_id, skill_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- -------------------------------------------------------
-- 8. employee_work_history
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_work_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    department_id INT NOT NULL,
    machine_id INT,
    skill_id INT,
    work_date DATE NOT NULL,
    hours_worked INT DEFAULT 8,
    productivity FLOAT DEFAULT 0,
    quality_score FLOAT DEFAULT 0,
    notes TEXT DEFAULT '',
    shift ENUM('DAY','NIGHT','EVENING') DEFAULT 'DAY',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (machine_id) REFERENCES machines(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- -------------------------------------------------------
-- 9. skill_matrices
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_matrices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    employee_id INT,
    description TEXT DEFAULT '',
    matrix_data JSON NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- -------------------------------------------------------
-- 10. department_performance
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS department_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    score FLOAT NOT NULL,
    employee_count INT NOT NULL,
    machine_count INT NOT NULL,
    calculated_at DATETIME DEFAULT NOW(),
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uq_dept_month_year (department_id, month, year),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ============================================================
-- SEED: Default admin user  (password: admin123)
-- ============================================================
INSERT IGNORE INTO departments (name, description) VALUES ('Administration', 'Admin Department');

INSERT IGNORE INTO employees (name, employeeId, departmentId, gender, title, email)
VALUES ('Admin User', 'EMP-ADMIN-001', 1, 'Male', 'System Administrator', 'admin@dawlance.com');

INSERT IGNORE INTO useraccount (email, password, role, employee_id)
VALUES ('admin@dawlance.com', '$2b$10$OIH3c696b/CUNAkCr6nDCO3y1wvsKKl74W/m0oiH94LKe3svQhE6u', 'admin', 1);
-- default password above is: admin123  (bcrypt hash)
