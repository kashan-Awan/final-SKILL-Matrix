import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Validate token and check expiry
    const tokenResult = await db.request()
      .input('token', token)
      .query(`
        SELECT email, expires_at FROM password_reset_tokens
        WHERE token = @token
      `);

    if (!tokenResult.recordset || tokenResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const { email, expires_at } = tokenResult.recordset[0];

    if (new Date() > new Date(expires_at)) {
      // Clean up expired token
      await db.request()
        .input('token', token)
        .query(`DELETE FROM password_reset_tokens WHERE token = @token`);

      return NextResponse.json(
        { success: false, message: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update the user's password in dawlance_user
    const updateResult = await db.request()
      .input('password', hashed)
      .input('email', email)
      .query(`
        UPDATE dawlance_user SET password = @password
        WHERE LOWER(email) = LOWER(@email) AND is_deleted = 0
      `);

    if (!updateResult.rowsAffected || updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, message: 'User account not found.' },
        { status: 404 }
      );
    }

    // Delete the used token so it cannot be reused
    await db.request()
      .input('token', token)
      .query(`DELETE FROM password_reset_tokens WHERE token = @token`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  } catch (error) {
    console.error('[reset-password] error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

