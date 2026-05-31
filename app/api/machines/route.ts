import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

async function proxy(req: NextRequest, backendPath: string) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const url = `${BACKEND}${backendPath}${qs ? '?' + qs : ''}`;
  const method = req.method;
  const isBody = ['POST','PUT','PATCH'].includes(method);
  const body = isBody ? await req.text() : undefined;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) { return proxy(req, '/machines'); }
export async function POST(req: NextRequest) { return proxy(req, '/machines'); }
export async function PUT(req: NextRequest) { return proxy(req, '/machines'); }
export async function DELETE(req: NextRequest) { return proxy(req, '/machines'); }
