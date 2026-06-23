import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5001/api';

/** Map frontend role 'user' → backend DB role 'employee', preserves casing otherwise */
export const mapRoleToDb = (role: string): string => {
  const r = role.trim();
  if (r.toLowerCase() === 'user') return 'employee';
  // Preserve original casing for other roles to match DB entries exactly
  return r;
};

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

    // Robust parsing to prevent crashes on non-JSON responses (e.g. 500 HTML)
    let data;
    // Handle 204 No Content
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { success: false, message: text || `Backend error: ${res.status}` };
    }

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
