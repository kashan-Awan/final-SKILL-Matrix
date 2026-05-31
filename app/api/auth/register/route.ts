import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

/** POST /api/auth/register — admin creates a new user account */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password and role are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'manager', 'user'];
    if (!validRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be admin, manager, or user.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check for duplicate email
    const existing = await db.request()
      .input('email', email.trim().toLowerCase())
      .query(`SELECT _id FROM dawlance_user WHERE LOWER(email) = @email AND is_deleted = 0`);

    if (existing.recordset.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const newId = crypto.randomBytes(12).toString('hex');

    await db.request()
      .input('id', newId)
      .input('name', name || email.trim())
      .input('email', email.trim().toLowerCase())
      .input('password', hashed)
      .input('role', role.toUpperCase())
      .query(`
        INSERT INTO dawlance_user (_id, name, email, password, role, is_deleted)
        VALUES (@id, @name, @email, @password, @role, 0)
      `);

    return NextResponse.json({
      success: true,
      message: `User '${name || email}' registered successfully.`,
    }, { status: 201 });

  } catch (error) {
    console.error('[POST /api/auth/register] error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
