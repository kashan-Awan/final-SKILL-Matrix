const BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const BASE_URL = BASE_URL_FROM_ENV.endsWith('/api') ? BASE_URL_FROM_ENV : `${BASE_URL_FROM_ENV}/api`;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function getToken(): string | null {
  try {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.token) return parsed.token;
    }
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();
  return json;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};