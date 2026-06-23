import { NextRequest, NextResponse } from 'next/server';
import { handleBackendProxy } from '@/lib/proxy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    return await handleBackendProxy(req, '/auth/login');
  } catch (error: unknown) {
    // Log the full error object for server-side debugging
    console.error('[Login API] Proxy failure:', error);
    
    return NextResponse.json(
      { error: 'The authentication service is currently unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}
