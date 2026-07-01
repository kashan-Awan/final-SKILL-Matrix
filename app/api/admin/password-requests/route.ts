import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/** GET /api/admin/password-requests → backend GET /api/admin/password-requests */
export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization') ?? '';
  const url = `${BACKEND}/api/admin/password-requests`;

  const upstream = await fetch(url, {
    headers: { Authorization: token },
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
