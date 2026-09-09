"use client";

export function AuthLoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Top badge skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          <div className="h-3.5 w-16 rounded bg-slate-100" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-5">
          <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-3.5 w-full rounded bg-slate-100" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-full rounded-xl bg-slate-200 mb-5" />

        {/* Value props skeleton box */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-4/5 rounded bg-slate-200" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="h-3 w-1/2 mx-auto rounded bg-slate-100" />
      </div>
    </div>
  );
}
