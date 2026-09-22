import { getBackendAuthHeaders } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function GET(request: Request) {
  const authResult = await getBackendAuthHeaders(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const queryStr = type ? `?type=${encodeURIComponent(type)}` : "";

    const response = await fetch(`${BACKEND_URL}/api/resumes${queryStr}`, {
      method: "GET",
      headers: authResult.headers,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch resumes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = await getBackendAuthHeaders(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/resumes`, {
      method: "POST",
      headers: authResult.headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
