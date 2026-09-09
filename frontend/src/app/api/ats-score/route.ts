import { auth } from "@/auth";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required to evaluate ATS resume score" },
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
    const body = await request.json();

    if (!body?.resumeId) {
      return NextResponse.json(
        { error: "Please select a resume to analyze." },
        { status: 400 },
      );
    }

    if (!body?.jobDescription || typeof body.jobDescription !== "string" || !body.jobDescription.trim()) {
      return NextResponse.json(
        { error: "Please enter or paste a valid job description." },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/ats-score/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
      body: JSON.stringify({
        resumeId: body.resumeId,
        jobDescription: body.jobDescription.trim(),
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to conduct ATS evaluation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
