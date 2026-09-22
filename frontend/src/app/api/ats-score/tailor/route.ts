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
        { error: "Please select a resume to tailor." },
        { status: 400 },
      );
    }

    if (
      !body?.jobDescription ||
      typeof body.jobDescription !== "string" ||
      !body.jobDescription.trim()
    ) {
      return NextResponse.json(
        { error: "Please enter or paste a valid job description." },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/ats-score/tailor`, {
      method: "POST",
      headers: authResult.headers,
      body: JSON.stringify({
        resumeId: body.resumeId,
        jobDescription: body.jobDescription.trim(),
        confirmedSkills: Array.isArray(body.confirmedSkills)
          ? body.confirmedSkills
          : [],
        rejectedSkills: Array.isArray(body.rejectedSkills)
          ? body.rejectedSkills
          : [],
        tailoredResumeId: body.tailoredResumeId || undefined,
        atsEvaluationId: body.atsEvaluationId || undefined,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to generate tailored resume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
