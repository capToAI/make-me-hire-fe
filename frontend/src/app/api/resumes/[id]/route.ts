import { auth } from "@/auth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required to view this resume" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const userIdentifier = session.user.id || session.user.email;

  try {
    const response = await fetch(`${BACKEND_URL}/api/resumes/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required to update this resume" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const userIdentifier = session.user.id || session.user.email;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/resumes/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required to delete this resume" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const userIdentifier = session.user.id || session.user.email;

  try {
    const response = await fetch(`${BACKEND_URL}/api/resumes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
