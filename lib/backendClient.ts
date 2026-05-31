import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

/** Map frontend role 'user' → backend DB role 'employee', others unchanged */
export const mapRoleToDb = (role: string): string =>
  role === 'user' ? 'employee' : role;

/** Map backend DB role 'employee'/'EMPLOYEE' → frontend role 'user', others lowercased */
export const mapRoleFromDb = (role: string): string =>
  role.toLowerCase() === 'employee' ? 'user' : role.toLowerCase();

/**
 * Proxy a server-side Next.js API route to the Express backend.
 * Automatically handles JSON serialisation and error wrapping.
 */
export async function proxyRequest(
  path: string,
  options?: RequestInit
): Promise<NextResponse> {
  try {
    const url = `${BACKEND}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[backendClient] proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Backend connection failed' },
      { status: 503 }
    );
  }
}

/** Build a backend URL with query params forwarded from the incoming Next.js Request */
export function buildBackendUrl(
  path: string,
  params: URLSearchParams
): string {
  const qs = params.toString();
  return `${BACKEND}${path}${qs ? `?${qs}` : ''}`;
}
