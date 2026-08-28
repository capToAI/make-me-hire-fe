"use client";

import { useResume } from "@/hooks/useResume";
import { FormPanel } from "@/components/FormPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function BuilderPage() {
  const { state, dispatch, hydrated } = useResume();

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold">Loading your resume workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 lg:h-screen lg:flex-row lg:overflow-hidden">
      <FormPanel state={state} dispatch={dispatch} />
      <PreviewPanel state={state} />
    </div>
  );
}
