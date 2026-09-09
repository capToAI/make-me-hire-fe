"use client";

import { useState } from "react";
import { Columns, FileText, Sparkles } from "lucide-react";
import type { ResumeState } from "@/lib/types";
import { PreviewPanel } from "@/components/PreviewPanel";

interface ResumeComparisonViewProps {
  originalResume: ResumeState;
  tailoredResume: ResumeState;
  resumeName: string;
  className?: string;
}

type ViewMode = "side-by-side" | "original" | "tailored";

export function ResumeComparisonView({
  originalResume,
  tailoredResume,
  resumeName,
  className = "h-full",
}: ResumeComparisonViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const safeResumeName = resumeName.trim().replace(/\s+/g, "_") || "Resume";

  return (
    <div
      className={`rounded-3xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs flex flex-col ${className}`}
    >
      {/* Top Header & Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Columns className="h-4 w-4 text-indigo-600" />
            <span>Resume Studio Comparison</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Paginated vector preview with full zoom & export controls.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "side-by-side"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("original")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "original"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Baseline</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("tailored")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "tailored"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tailored</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Containers */}
      <div className="flex-1 min-h-0 pt-3">
        {viewMode === "side-by-side" ? (
          <div className="h-full grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Left: Original Resume Preview */}
            <div
              id="original-preview-container"
              className="h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex flex-col"
            >
              <PreviewPanel
                state={originalResume}
                label="Current"
                badgeText="Baseline"
                badgeColor="bg-slate-200 text-slate-700"
                customFileName={`${safeResumeName}_Current`}
                className="h-full"
              />
            </div>

            {/* Right: Tailored Resume Preview */}
            <div
              id="tailored-preview-container"
              className="h-full min-h-[480px] rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xs flex flex-col"
            >
              <PreviewPanel
                state={tailoredResume}
                label="Tailored"
                badgeText="ATS Optimized"
                badgeColor="bg-emerald-100 text-emerald-800"
                customFileName={`${safeResumeName}_Tailored`}
                className="h-full"
              />
            </div>
          </div>
        ) : viewMode === "original" ? (
          <div
            id="original-preview-container"
            className="h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex flex-col"
          >
            <PreviewPanel
              state={originalResume}
              label="Current Resume"
              badgeText="Original Baseline"
              badgeColor="bg-slate-200 text-slate-700"
              customFileName={`${safeResumeName}_Current`}
              className="h-full"
            />
          </div>
        ) : (
          <div
            id="tailored-preview-container"
            className="h-full min-h-[520px] rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xs flex flex-col"
          >
            <PreviewPanel
              state={tailoredResume}
              label="Tailored Resume"
              badgeText="ATS Optimized"
              badgeColor="bg-emerald-100 text-emerald-800"
              customFileName={`${safeResumeName}_Tailored`}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
