import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, ensurePasswordChangeRequestsTable } from '@/lib/db';

/** GET /api/auth/password-change-requests — admin fetches all requests */
export async function GET(_req: NextRequest) {
  try {
    await ensurePasswordChangeRequestsTable();
    const db = await getDb();

    const result = await db.request().query(`
      SELECT
        id,
        user_id,
        user_name,
        email,
        role,
        status,
        requested_at,
        resolved_at,
        resolved_by
      FROM password_change_requests
      ORDER BY
        CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
        requested_at DESC
    `);

    return NextResponse.json({ success: true, requests: result.recordset });
  } catch (error) {
    console.error('[GET /api/auth/password-change-requests] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load requests.' },
      { status: 500 }
    );
  }
}

/** POST /api/auth/password-change-requests — user submits a new request */
export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Ensure table exists first (no db argument needed)
    await ensurePasswordChangeRequestsTable();
    const db = await getDb();

    // Look up user in dawlance_user
    const userResult = await db.request()
      .input('email', email.trim().toLowerCase())
      .query(`
        SELECT
          u._id AS id,
          u.email,
          u.role,
          u.name
        FROM dawlance_user u
        WHERE LOWER(u.email) = @email AND u.is_deleted = 0
      `);

    // Always return generic success to prevent user enumeration
    const genericOk = NextResponse.json({
      success: true,
      message: 'Your request has been submitted and is pending admin approval.',
    });

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return genericOk;
    }

    const user = userResult.recordset[0];

    // Cancel any existing pending request for this user first
    await db.request()
      .input('userId', user.id)
      .query(`
        DELETE FROM password_change_requests
        WHERE user_id = @userId AND status = 'pending'
      `);

    // Hash the new password — admin never sees the plaintext
    const hashed = await bcrypt.hash(newPassword, 12);

    await db.request()
      .input('userId', user.id)
      .input('userName', user.name)
      .input('email', user.email)
      .input('role', user.role)
      .input('hash', hashed)
      .query(`
        INSERT INTO password_change_requests
          (user_id, user_name, email, role, new_password_hash, status, requested_at)
        VALUES
          (@userId, @userName, @email, @role, @hash, 'pending', GETDATE())
      `);

    return genericOk;
  } catch (error) {
    console.error('[POST /api/auth/password-change-requests] error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
