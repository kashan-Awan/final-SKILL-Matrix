import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface RouteContext {
  params: { id: string; action: string };
}

/** POST /api/admin/password-requests/[id]/[action] → backend approve/reject */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const token = req.headers.get('Authorization') ?? '';
  const { id, action } = params;

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  }

  const url = `${BACKEND}/api/admin/password-requests/${id}/${action}`;

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
