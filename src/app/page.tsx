"use client";

import { useResume } from "@/hooks/useResume";
import { FormPanel } from "@/components/FormPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function Home() {
  const { state, dispatch, hydrated } = useResume();

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100 text-zinc-500">
        Loading your draft…
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
