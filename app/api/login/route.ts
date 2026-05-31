import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

/** POST /api/login — mirrors /api/auth/login */
export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password and role are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.request()
      .input('email', email.trim().toLowerCase())
      .query(`
        SELECT
          u.id, u.email, u.password, u.role, u.employee_id,
          COALESCE(e.name, m.name, u.email) AS name,
          COALESCE(e.departmentId, m.departmentId) AS department_id
        FROM useraccount u
        LEFT JOIN employees e ON u.employee_id = e.id
        LEFT JOIN managers  m ON u.email = m.email
        WHERE LOWER(u.email) = @email
      `);

    const user = result.recordset[0];
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Incorrect role selected.' },
        { status: 403 }
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
        department: user.department_id,
        loginTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[/api/login] error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
