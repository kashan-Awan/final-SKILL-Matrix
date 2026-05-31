import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/** GET /api/auth/users — returns all useraccount rows (admin only) */
export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();

    const result = await db.request().query(`
      SELECT
        u._id        AS id,
        u.email,
        u.role,
        u.employeeId AS employee_id,
        u.name,
        CASE WHEN u.is_deleted = 0 THEN 1 ELSE 0 END AS is_active
      FROM dawlance_user u
      WHERE u.is_deleted = 0
      ORDER BY u.name
    `);

    return NextResponse.json({ success: true, users: result.recordset });
  } catch (error) {
    console.error('[GET /api/auth/users] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load users.' },
      { status: 500 }
    );
  }
}

/** DELETE /api/auth/users — removes a user account (admin only) */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { success: false, message: 'Valid user ID is required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.request()
      .input('id', String(userId))
      .query(`UPDATE dawlance_user SET is_deleted = 1 WHERE _id = @id`);

    if (!result.rowsAffected || result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    console.error('[DELETE /api/auth/users] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
