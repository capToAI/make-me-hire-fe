"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useResume } from "@/hooks/useResume";
import { FormPanel } from "@/components/FormPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const { status } = useSession();
  const {
    state,
    dispatch,
    hydrated,
    resumeName,
    setResumeName,
    position,
    setPosition,
    saveStatus,
    lastSavedAt,
    loadError,
    saveNow,
  } = useResume(resumeId);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/?error=SignInRequired");
    }
  }, [status, router]);

  if (loadError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 shadow-xs">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Unable to Open Resume
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          {loadError}
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!hydrated || status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold">
            {status === "unauthenticated"
              ? "Sign in required. Redirecting…"
              : "Loading your resume workspace…"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 lg:h-screen lg:flex-row lg:overflow-hidden">
      <FormPanel
        state={state}
        dispatch={dispatch}
        resumeName={resumeName}
        setResumeName={setResumeName}
        position={position}
        setPosition={setPosition}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        saveNow={saveNow}
      />
      <PreviewPanel state={state} />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="text-sm font-semibold">Loading editor…</span>
          </div>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
