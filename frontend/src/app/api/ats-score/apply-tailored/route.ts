import { getBackendAuthHeaders } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function POST(request: Request) {
  const authResult = await getBackendAuthHeaders(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();

    if (!body?.resumeId) {
      return NextResponse.json(
        { error: "Missing resume identifier." },
        { status: 400 },
      );
    }

    if (!body?.tailoredData) {
      return NextResponse.json(
        { error: "Missing tailored resume payload." },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/ats-score/apply-tailored`, {
      method: "POST",
      headers: authResult.headers,
      body: JSON.stringify({
        resumeId: body.resumeId,
        tailoredData: body.tailoredData,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to apply tailored resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
