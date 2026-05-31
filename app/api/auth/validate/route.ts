import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/** POST /api/auth/validate — verifies a stored session is still valid */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, id } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.request()
      .input('email', String(email).toLowerCase())
      .query(`
        SELECT
          u._id        AS id,
          u.email,
          u.role,
          u.employeeId AS employee_id,
          u.name,
          u.departmentId AS department_id,
          d.name AS department_name
        FROM dawlance_user u
        LEFT JOIN departments d ON u.departmentId = d.id AND d.is_deleted = 0
        WHERE LOWER(u.email) = @email AND u.is_deleted = 0
      `);

    const user = result.recordset[0];
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Session invalid — user not found.' },
        { status: 401 }
      );
    }

    // If role is supplied, confirm it still matches
    if (role && user.role.toLowerCase() !== String(role).toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Session invalid — role mismatch.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session valid.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employee_id,
        department: user.department_name,
        departmentId: user.department_id,
      },
    });
  } catch (error) {
    console.error('[validate] error:', error);
    return NextResponse.json(
      { success: false, message: 'Validation failed.' },
      { status: 500 }
    );
  }
}
