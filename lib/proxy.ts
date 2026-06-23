import { NextRequest } from 'next/server';

/**
 * A utility to proxy requests from Next.js Route Handlers to the external backend API.
 * 
 * @param req - The incoming NextRequest from the frontend.
 * @param path - The destination path on the backend (e.g., '/auth/login').
 * @returns The Response from the backend server.
 */

// Use the same environment variable defined in your backendClient.ts
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export async function handleBackendProxy(req: NextRequest, path: string): Promise<Response> {
  // 1. Construct the target URL, appending query parameters from the original request
  const targetUrl = `${BACKEND_API_URL}${path}${req.nextUrl.search}`;

  // 2. Prepare Headers
  // We clone the client's headers but strip 'host' and 'connection' to prevent 
  // the backend from misidentifying the request origin or connection state.
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  // Allow fetch to recalculate the content-length for the forwarded stream
  headers.delete('content-length');

  try {
    // 3. Forward the request
    // Passing req.body (a ReadableStream) directly is efficient.
    // 'duplex: half' is required when forwarding a stream via fetch in Node.js environments.
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body,
      // @ts-ignore - duplex is a required property for streaming bodies in the current fetch spec
      duplex: 'half',
    });

    // 4. Return the Response
    // This allows the route handler to return the exact status, data, and headers 
    // (like Set-Cookie) provided by the backend.
    return response;
  } catch (error) {
    // Log the network error locally and re-throw so the Route Handler's 
    // catch block can provide a clean 500 response.
    console.error(`[Proxy Utility] Failed to fetch ${targetUrl}:`, error);
    throw error;
  }
}