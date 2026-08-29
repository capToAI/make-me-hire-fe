"use client";

export function AuthLoadingSkeleton() {
  return (
    <div className="max-w-xl mx-auto w-full animate-pulse">
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-7 sm:p-10 shadow-sm">
        {/* Top badge skeleton */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-28 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2.5 mb-6">
          <div className="h-8 w-3/4 rounded-xl bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
        </div>

        {/* Value props skeleton box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3.5 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3.5 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3.5 w-4/5 rounded bg-slate-200" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-14 w-full rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
