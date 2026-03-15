/**
 * API proxy route handler
 * Proxies /api/v1/* to the backend and explicitly forwards cookies and headers.
 * Required for COOKIE_ONLY_AUTH: Next.js rewrites may not forward Cookie header
 * when proxying to an external URL, causing 401 on protected routes.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const FORWARD_HEADERS = [
  "authorization",
  "content-type",
  "x-csrf-token",
  "x-acting-as",
  "x-forwarded-for",
  "x-forwarded-proto",
  "user-agent",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "DELETE");
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "OPTIONS");
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  const { path } = await params;
  const pathStr = path?.length ? path.join("/") : "";
  const search = request.nextUrl.search;
  const url = `${BACKEND_ORIGIN}/api/v1/${pathStr}${search}`;

  const headers = new Headers();

  // Explicitly forward Cookie header (critical for COOKIE_ONLY_AUTH)
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "OPTIONS" && request.body) {
    body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const resHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "transfer-encoding" &&
        key.toLowerCase() !== "connection"
      ) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("[API Proxy] Backend fetch failed:", err);
    return NextResponse.json(
      { message: "Backend unavailable. Please ensure the backend is running." },
      { status: 502 }
    );
  }
}
