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
    // Use the same robust query logic as the login route
    const result = await db.request()
      .input('email', String(email).trim().toLowerCase())
      .query(`
        SELECT
          COALESCE(u._id, u.id) AS id,
          u.email,
          u.role,
          u.employeeId AS employee_id,
          u.name,
          u.departmentId AS department_id,
          d.name AS department_name
        FROM dawlance_user u
        LEFT JOIN departments d ON u.departmentId = d.id AND d.is_deleted = 0
        -- Support lookup by email OR employeeId and handle padding
        WHERE (LOWER(LTRIM(RTRIM(u.email))) = @email OR LOWER(LTRIM(RTRIM(u.employeeId))) = @email)
          AND (u.is_deleted = 0 OR u.is_deleted IS NULL)
      `);

    const user = result.recordset[0];
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Session invalid — user not found.' },
        { status: 401 }
      );
    }

    // If role is supplied, confirm it still matches
    // Use trim() to handle fixed-length CHAR columns in DB
    if (role && String(user.role).trim().toLowerCase() !== String(role).trim().toLowerCase()) {
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
