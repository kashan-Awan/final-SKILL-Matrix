-- ============================================================
-- Dawlance Skills Matrix - SSMS 2016 Setup Script
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Dawlance_Skills_Matrix')
CREATE DATABASE Dawlance_Skills_Matrix;
GO
USE Dawlance_Skills_Matrix;
GO

CREATE TABLE departments (
    id CHAR(24) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(MAX) DEFAULT '',
    is_deleted BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE dawlance_user (
    _id NVARCHAR(24) PRIMARY KEY,
    employeeId NVARCHAR(20) NOT NULL UNIQUE,
    role NVARCHAR(10) NOT NULL, -- 'admin', 'manager', 'employee'
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255),
    phone NVARCHAR(30),
    departmentId CHAR(24),
    gender NVARCHAR(10),
    title NVARCHAR(100),
    yearsExperience INT DEFAULT 0,
    hireDate DATETIME2,
    isActive BIT DEFAULT 1,
    is_deleted BIT DEFAULT 0,
    __v INT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);
GO

CREATE TABLE employee_skills (
    id CHAR(24) PRIMARY KEY,
    employee_id NVARCHAR(24) NOT NULL,
    skill_id NVARCHAR(24) NOT NULL,
    level NVARCHAR(20) DEFAULT 'Low',
    acquiredDate DATETIME2,
    lastAssessedDate DATETIME2,
    notes NVARCHAR(MAX) DEFAULT '',
    is_deleted BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (employee_id) REFERENCES dawlance_user(_id)
);
GO

CREATE TABLE employee_work_history (
    _id NVARCHAR(24) PRIMARY KEY,
    employeeId NVARCHAR(24) NOT NULL,
    departmentId CHAR(24) NOT NULL,
    productivity INT DEFAULT 0,
    qualityScore INT DEFAULT 0,
    hoursWorked INT DEFAULT 8,
    workDate DATETIME2 DEFAULT GETDATE(),
    shift NVARCHAR(10) DEFAULT 'DAY',
    is_deleted BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (employeeId) REFERENCES dawlance_user(_id),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);
GO

CREATE TABLE skill_matrix (
    _id NVARCHAR(24) PRIMARY KEY,
    departmentId CHAR(24) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    matrixData NVARCHAR(MAX) NOT NULL, -- JSON string
    isActive BIT DEFAULT 1,
    is_deleted BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);
GO

-- SEED: Default admin user
INSERT INTO departments (id, name, description) VALUES ('662b9a000000000000000001', 'Administration', 'Admin Dept');
INSERT INTO dawlance_user (_id, employeeId, role, name, email, password, departmentId, is_deleted)
VALUES ('662b9a000000000000000002', 'EMP-ADMIN-001', 'admin', 'Admin User', 'admin@dawlance.com', 
'$2a$10$OIH3c696b/CUNAkCr6nDCO3y1wvsKKl74W/m0oiH94LKe3svQhE6u', '662b9a000000000000000001', 0);
GO
