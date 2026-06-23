import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5001/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const url = `${BACKEND}/dashboard/machine-scores${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
