import { auth } from "@/auth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required to view ATS evaluation history" },
      { status: 401 },
    );
  }

  const userIdentifier = session.user.id || session.user.email;
  if (!userIdentifier) {
    return NextResponse.json(
      { error: "User identity not found in session" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");
    const limit = searchParams.get("limit");

    const query = new URLSearchParams();
    if (resumeId) query.set("resumeId", resumeId);
    if (limit) query.set("limit", limit);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await fetch(`${BACKEND_URL}/api/ats-score/history${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch ATS evaluation history";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
