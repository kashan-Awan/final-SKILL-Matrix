import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.request().query('SELECT 1 AS ping');
    return NextResponse.json({ success: true, status: 'ok', message: 'Database connected' });
  } catch (error) {
    return NextResponse.json(
      { success: false, status: 'error', message: 'Database connection failed' },
      { status: 503 }
    );
  }
}
