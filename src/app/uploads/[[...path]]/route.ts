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

function backendOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function forwardHeaders(from: Headers): Headers {
  const out = new Headers();
  from.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    out.append(key, value);
  });
  return out;
}

async function proxyUpload(request: NextRequest, pathSegments: string[] | undefined) {
  const origin = backendOrigin();
  if (!origin) {
    return NextResponse.json(
      { success: false, message: "NEXT_PUBLIC_BACKEND_URL is not set" },
      { status: 503 }
    );
  }

  const tail = pathSegments?.length ? pathSegments.join("/") : "";
  const target = `${origin}/uploads/${tail}${request.nextUrl.search}`;

  try {
    const backendRes = await fetch(target, {
      method: "GET",
      headers: forwardHeaders(request.headers),
      redirect: "manual",
    });
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: backendRes.headers,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot connect to backend uploads." },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  return proxyUpload(request, path);
}
