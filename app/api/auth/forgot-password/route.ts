import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, ensureResetTokensTable } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Look up by email only — avoids 'user' vs 'employee' role-value ambiguity
    // and prevents accidental enumeration of which roles a user belongs to.
    const result = await db.request()
      .input('email', email.trim().toLowerCase())
      .query(`
        SELECT _id AS id, email FROM dawlance_user
        WHERE LOWER(email) = @email AND is_deleted = 0
      `);

    // Always return generic success to prevent email enumeration
    const genericResponse = NextResponse.json({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
    });

    if (!result.recordset || result.recordset.length === 0) {
      return genericResponse;
    }

    // Generate a secure random token (48 bytes → 96-char hex string)
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Ensure the table exists, then replace any existing token for this email
    await ensureResetTokensTable();
    await db.request()
      .input('email', email.trim().toLowerCase())
      .query(`DELETE FROM password_reset_tokens WHERE email = @email`);

    await db.request()
      .input('email', email.trim().toLowerCase())
      .input('token', token)
      .input('expiresAt', expiresAt)
      .query(`
        INSERT INTO password_reset_tokens (email, token, expires_at)
        VALUES (@email, @token, @expiresAt)
      `);

    // Build the reset link — include role so the reset page can display it
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
    const resetLink = `${appUrl}/reset-password?token=${token}${roleParam}`;

    await sendPasswordResetEmail(email.trim(), resetLink);

    return genericResponse;
  } catch (error) {
    console.error('[forgot-password] error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
