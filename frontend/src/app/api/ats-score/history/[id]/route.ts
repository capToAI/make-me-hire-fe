import { getBackendAuthHeaders } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getBackendAuthHeaders(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Evaluation ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/ats-score/history/${id}`, {
      method: "GET",
      headers: authResult.headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch ATS evaluation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getBackendAuthHeaders(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Evaluation ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/ats-score/history/${id}`, {
      method: "DELETE",
      headers: authResult.headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to delete ATS evaluation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
