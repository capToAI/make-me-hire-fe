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
      { error: "Authentication required to apply changes to your resume." },
      { status: 401 },
    );
  }

  const userIdentifier = session.user.id || session.user.email;
  if (!userIdentifier) {
    return NextResponse.json(
      { error: "User identity not found in session." },
      { status: 401 },
    );
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
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(userIdentifier),
        "x-user-email": session.user.email || "",
      },
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
