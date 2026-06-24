import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

interface RouteContext {
  params: { requestId: string };
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const { requestId } = params;
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'requestId is required.' }, { status: 400 });
    }

    const db = await getDb();

    // Fetch pending request
    const reqResult = await db.request()
      .input('id', requestId)
      .query(`
        SELECT
          id,
          name,
          email,
          employeeId,
          role,
          status
        FROM pending_user_registrations
        WHERE id = @id
      `);

    if (!reqResult.recordset || reqResult.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Registration request not found.' }, { status: 404 });
    }

    const registration = reqResult.recordset[0] as any;

    if (registration.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'This request has already been resolved.' }, { status: 409 });
    }

    // Create password placeholder (system might require it). If you already store password elsewhere,
    // replace this logic accordingly.
    const placeholderPassword = crypto.randomBytes(12).toString('hex');

    // You may have hashing utility in lib/bcrypt.ts. To keep consistent with the repo, reuse bcryptjs if available.
    // Fallback: store plaintext is insecure; however the existing codebase uses bcryptjs for passwords.
    const bcrypt = (await import('bcryptjs')).default as typeof import('bcryptjs');
    const hashed = await bcrypt.hash(placeholderPassword, 12);

    const newId = crypto.randomBytes(12).toString('hex');

    // Insert the real user
    // NOTE: We set is_deleted=0 (active by default). Adjust fields if your schema differs.
    await db.request()
      .input('id', newId)
      .input('name', registration.name || registration.email)
      .input('email', String(registration.email).trim().toLowerCase())
      .input('password', hashed)
      .input('role', String(registration.role).toUpperCase())
      .input('employeeId', registration.employeeId ?? null)
      .query(`
        INSERT INTO dawlanance_user
          (_id, name, email, password, role, employeeId, is_deleted)
        VALUES
          (@id, @name, @email, @password, @role, @employeeId, 0)
      `);

    // Move the request to approved
    await db.request()
      .input('status', 'approved')
      .input('resolvedAt', new Date())
      .input('id', requestId)
      .query(`
        UPDATE pending_user_registrations
        SET status = @status,
            resolved_at = GETDATE()
        WHERE id = @id
      `);

    return NextResponse.json({
      success: true,
      message: 'Registration approved.',
    });
  } catch (error) {
    console.error('[POST /api/auth/registrations/:requestId/approve] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve registration.' },
      { status: 500 }
    );
  }
}

