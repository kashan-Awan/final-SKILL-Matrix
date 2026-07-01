import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, ensurePasswordChangeRequestsTable } from '@/lib/db';

interface RouteContext {
  params: { id: string };
}

/** PATCH /api/auth/password-change-requests/[id] — admin approves or rejects */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { action, adminEmail } = await req.json(); // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be "approve" or "reject".' },
        { status: 400 }
      );
    }

    const requestId = parseInt(params.id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request ID.' },
        { status: 400 }
      );
    }

    await ensurePasswordChangeRequestsTable();
    const db = await getDb();

    // Fetch the request
    const reqResult = await db.request()
      .input('id', requestId)
      .query(`
        SELECT id, user_id, email, new_password_hash, status
        FROM password_change_requests
        WHERE id = @id
      `);

    if (!reqResult.recordset || reqResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Request not found.' },
        { status: 404 }
      );
    }

    const changeReq = reqResult.recordset[0];

    if (changeReq.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'This request has already been resolved.' },
        { status: 409 }
      );
    }

    if (action === 'approve') {
      // Apply the pre-hashed password to dawlance_user
      await db.request()
        .input('hash', changeReq.new_password_hash)
        .input('email', changeReq.email)
        .query(`
          UPDATE dawlance_user
          SET password = @hash
          WHERE LOWER(email) = LOWER(@email)
        `);
    }

    // Mark request as resolved
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.request()
      .input('status', newStatus)
      .input('resolvedBy', adminEmail || 'admin')
      .input('id', requestId)
      .query(`
        UPDATE password_change_requests
        SET status = @status, resolved_at = GETDATE(), resolved_by = @resolvedBy
        WHERE id = @id
      `);

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Password change approved and applied.'
        : 'Password change request rejected.',
    });
  } catch (error) {
    console.error('[PATCH /api/auth/password-change-requests/:id] error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
