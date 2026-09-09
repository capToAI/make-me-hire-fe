"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, FileText, Sparkles } from "lucide-react";
import type { ResumeState } from "@/lib/types";
import { PreviewPanel } from "@/components/PreviewPanel";

interface ResumeComparisonViewProps {
  originalResume: ResumeState;
  tailoredResume: ResumeState;
  resumeName: string;
  resumeId?: string;
  className?: string;
}

type TabType = "tailored" | "base";

export function ResumeComparisonView({
  originalResume,
  tailoredResume,
  resumeName,
  resumeId,
  className = "h-full",
}: ResumeComparisonViewProps) {
  // Tailored tab is first and active by default
  const [activeTab, setActiveTab] = useState<TabType>("tailored");
  const safeResumeName = resumeName.trim().replace(/\s+/g, "_") || "Resume";

  const currentResume = activeTab === "tailored" ? tailoredResume : originalResume;
  const currentLabel = activeTab === "tailored" ? "Tailored Resume" : "Base Resume";
  const currentBadge = activeTab === "tailored" ? "ATS Optimized" : "Original Baseline";
  const currentBadgeColor =
    activeTab === "tailored"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";
  const currentFileName =
    activeTab === "tailored"
      ? `${safeResumeName}_Tailored`
      : `${safeResumeName}_Base`;

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs flex flex-col ${className}`}
    >
      {/* Top Toolbar: Tabs on Left, Quick Actions on Right */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
        {/* Tab Switcher: Tailored (First) & Base Resume (Second) */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("tailored")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "tailored"
                ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tailored</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("base")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "base"
                ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>Base Resume</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {resumeId && (
            <Link
              href={`/builder?id=${encodeURIComponent(resumeId)}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit in Builder</span>
            </Link>
          )}
        </div>
      </div>

      {/* Single PDF Preview Canvas */}
      <div className="flex-1 min-h-0 pt-3">
        <div className="h-full min-h-[580px] rounded-xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col">
          <PreviewPanel
            key={activeTab}
            state={currentResume}
            label={currentLabel}
            badgeText={currentBadge}
            badgeColor={currentBadgeColor}
            customFileName={currentFileName}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
