import { NextRequest, NextResponse } from "next/server";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

/** Strip hop-by-hop headers; forward the rest (including Cookie). */
function forwardRequestHeaders(from: Headers): Headers {
  const out = new Headers();
  from.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    out.append(key, value);
  });
  return out;
}

/** Forward backend response; handle multiple Set-Cookie correctly. */
function toProxiedResponse(backend: Response): NextResponse {
  const skip = new Set(["transfer-encoding", "content-encoding", "content-length"]);
  const res = new NextResponse(backend.body, {
    status: backend.status,
    statusText: backend.statusText,
  });
  backend.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (skip.has(k)) return;
    if (k === "set-cookie") {
      res.headers.append(key, value);
    } else {
      res.headers.set(key, value);
    }
  });
  return res;
}

function getBackendApiV1Base(): string | null {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!raw) return null;
  try {
    const origin = new URL(raw).origin;
    return `${origin}/api/v1`;
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, pathSegments: string[] | undefined) {
  const base = getBackendApiV1Base();
  if (!base) {
    return NextResponse.json(
      { success: false, message: "NEXT_PUBLIC_BACKEND_URL is not set" },
      { status: 503 }
    );
  }

  const tail = pathSegments?.length ? pathSegments.join("/") : "";
  const search = request.nextUrl.search;
  const target = tail ? `${base}/${tail}${search}` : `${base}${search}`;

  const headers = forwardRequestHeaders(request.headers);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const backendRes = await fetch(target, init);
    return toProxiedResponse(backendRes);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Cannot connect to backend. Ensure it is running and NEXT_PUBLIC_BACKEND_URL matches its URL.",
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
