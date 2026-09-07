"use client";

import { useState } from "react";
import { Columns, FileText, Sparkles } from "lucide-react";
import type { ResumeState } from "@/lib/types";
import { PreviewPanel } from "@/components/PreviewPanel";

interface ResumeComparisonViewProps {
  originalResume: ResumeState;
  tailoredResume: ResumeState;
  resumeName: string;
}

type ViewMode = "side-by-side" | "original" | "tailored";

export function ResumeComparisonView({
  originalResume,
  tailoredResume,
  resumeName,
}: ResumeComparisonViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const safeResumeName = resumeName.trim().replace(/\s+/g, "_") || "Resume";

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 lg:p-8 shadow-xs space-y-6">
      {/* Top Header & Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 mb-2">
            <Columns className="h-3.5 w-3.5 text-slate-500" />
            <span>Interactive Multi-Page Comparison</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Compare Current vs. Tailored Resume
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Both views render identical real-time pagination, vector typography, and export services as the editor.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
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
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "original"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Current Resume</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("tailored")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "tailored"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tailored Resume</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Containers */}
      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Original Resume Preview */}
          <div
            id="original-preview-container"
            className="h-[760px] rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex flex-col"
          >
            <PreviewPanel
              state={originalResume}
              label="Current Resume"
              badgeText="Baseline"
              badgeColor="bg-slate-200 text-slate-700"
              customFileName={`${safeResumeName}_Current`}
              className="h-full"
            />
          </div>

          {/* Right: Tailored Resume Preview */}
          <div
            id="tailored-preview-container"
            className="h-[760px] rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xs flex flex-col"
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
        </div>
      ) : viewMode === "original" ? (
        <div
          id="original-preview-container"
          className="h-[820px] max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex flex-col"
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
          className="h-[820px] max-w-5xl mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xs flex flex-col"
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
  );
}
