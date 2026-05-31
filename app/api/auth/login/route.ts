import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password and role are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Map frontend role 'user' to stored role 'employee'
    const dbRole = role.toLowerCase() === 'user' ? 'employee' : role.toLowerCase();

    // Fetch user from dawlance_user, join departments to resolve department name
    const result = await db.request()
      .input('email', email.trim().toLowerCase())
      .input('role', dbRole.toUpperCase())
      .query(`
        SELECT
          u._id        AS id,
          u.email,
          u.password,
          u.role,
          u.employeeId AS employee_id,
          u.name,
          u.departmentId AS department_id,
          d.name AS department_name
        FROM dawlance_user u
        LEFT JOIN departments d ON u.departmentId = d.id AND d.is_deleted = 0
        WHERE u.email = @email AND UPPER(u.role) = @role AND u.is_deleted = 0
      `);

    const user = result.recordset[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        employeeId: user.employee_id,
        role: user.role,
        department: user.department_name,
        departmentId: user.department_id,
        loginTime: new Date().toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
