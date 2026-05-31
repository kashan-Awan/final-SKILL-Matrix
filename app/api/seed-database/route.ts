import { NextRequest, NextResponse } from 'next/server';

// No-op: backend uses MSSQL (already configured)
export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, message: 'Using existing MSSQL database — no seeding needed' });
}

export async function POST(req: NextRequest) {
  return GET(req);
}

