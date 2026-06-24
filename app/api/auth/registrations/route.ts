import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const statusParam = (url.searchParams.get('status') || 'pending').toLowerCase();
    const status: RegistrationStatus =
      statusParam === 'approved' || statusParam === 'rejected' || statusParam === 'pending'
        ? statusParam
        : 'pending';

    const db = await getDb();

    const result = await db.request()
      .input('status', status)
      .query(`
        SELECT
          id,
          name,
          email,
          employeeId,
          role,
          status,
          rejectionReason,
          requested_at,
          resolved_at
        FROM pending_user_registrations
        WHERE status = @status
        ORDER BY requested_at DESC
      `);

    // Counts stats (independent from status filter)
    const countsResult = await db.request().query(`
      SELECT
        SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END)  AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)  AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)  AS rejected
      FROM pending_user_registrations
    `);

    const countsRow = countsResult.recordset?.[0] || { pending: 0, approved: 0, rejected: 0 };

    const requests = (result.recordset || []).map((r: any) => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      employeeId: r.employeeId ?? null,
      role: r.role,
      status: r.status,
      rejectionReason: r.rejectionReason ?? null,
      requestedAt: r.requested_at,
      resolvedAt: r.resolved_at ?? null,
    }));

    return NextResponse.json({
      success: true,
      requests,
      counts: {
        pending: Number(countsRow.pending || 0),
        approved: Number(countsRow.approved || 0),
        rejected: Number(countsRow.rejected || 0),
      },
      message: 'Registration requests retrieved',
    });
  } catch (error) {
    console.error('[GET /api/auth/registrations] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve registration requests.' },
      { status: 500 }
    );
  }
}

