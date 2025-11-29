import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Proxy endpoint that forwards authenticated frontend requests to the internal chunker service.
  // This file runs server-side (Next.js) and should not be bundled to the client.

  const body = await request.text();

  // Server-side service key from environment - must be set in deployment
  const SERVICE_API_KEY = process.env.CHUNKER_SERVICE_API_KEY || process.env.SERVICE_API_KEY || 'devkey';

  const chunkerUrl = process.env.CHUNKER_URL || 'http://localhost:8000/v1/chunk';

  const resp = await fetch(chunkerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': SERVICE_API_KEY,
    },
    body,
  });

  const text = await resp.text();
  return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
}
