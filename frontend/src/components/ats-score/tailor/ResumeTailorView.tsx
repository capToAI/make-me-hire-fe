"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import type { TailoredResumeResponse } from "@/lib/types";
import { TailorScoreComparison } from "./TailorScoreComparison";
import { SuggestedSkillsReview } from "./SuggestedSkillsReview";
import { TailorChangesList } from "./TailorChangesList";
import { ResumeComparisonView } from "./ResumeComparisonView";

interface ResumeTailorViewProps {
  tailoredResult: TailoredResumeResponse;
  jobDescription: string;
  onDiscard: () => void;
  onRecalculateWithSkills: (
    confirmedSkills: string[],
    rejectedSkills: string[]
  ) => Promise<void>;
  isRecalculating: boolean;
}

export function ResumeTailorView({
  tailoredResult,
  jobDescription,
  onDiscard,
  onRecalculateWithSkills,
  isRecalculating,
}: ResumeTailorViewProps) {
  const router = useRouter();

  // Local state for skill selections
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);
  const [rejectedSkills, setRejectedSkills] = useState<string[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Studio Sidebar Tab: "skills" | "changes"
  const [activeSideTab, setActiveSideTab] = useState<"skills" | "changes">("skills");

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract original skills list for display
  const originalSkillsSection = Object.values(
    tailoredResult.originalResumeData.sections || {}
  ).find((sec) => sec.type === "skills");
  const existingSkills: string[] = Array.isArray(
    (originalSkillsSection?.data as any)?.items
  )
    ? (originalSkillsSection?.data as any).items
    : [];

  const handleConfirmSkill = (skillName: string) => {
    setConfirmedSkills((prev) => Array.from(new Set([...prev, skillName])));
    setRejectedSkills((prev) => prev.filter((s) => s !== skillName));
    setHasPendingChanges(true);
  };

  const handleRejectSkill = (skillName: string) => {
    setRejectedSkills((prev) => Array.from(new Set([...prev, skillName])));
    setConfirmedSkills((prev) => prev.filter((s) => s !== skillName));
    setHasPendingChanges(true);
  };

  const handleRecalculate = async () => {
    setErrorMessage(null);
    try {
      await onRecalculateWithSkills(confirmedSkills, rejectedSkills);
      setHasPendingChanges(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update tailored resume";
      setErrorMessage(msg);
    }
  };

  const totalChangesCount =
    (tailoredResult.changes?.summary?.length || 0) +
    (tailoredResult.changes?.experience?.length || 0) +
    (tailoredResult.changes?.keywords?.length || 0) +
    (tailoredResult.changes?.skills?.length || 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <div className="no-print flex items-center justify-between border-b border-slate-200 pb-3">
        {/* Left: Discard / Return action & title */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Return to Score</span>
          </button>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
            <span className="font-bold text-slate-800 truncate">
              {tailoredResult.resumeName}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-700 font-semibold truncate">
              Tailoring Studio
            </span>
          </div>
        </div>
      </div>


      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-rose-900">Tailoring Notice</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* AI Studio Split-Screen Layout */}
      <div className="flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
        {/* Left Column: Controls & AI Insights (Compact Score + Tabbed Review) */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col gap-3">
          {/* 1. Compact Score Delta Card */}
          <TailorScoreComparison
            originalScore={tailoredResult.originalScore}
            originalRank={tailoredResult.originalRank}
            tailoredScore={tailoredResult.tailoredScore}
            tailoredRank={tailoredResult.tailoredRank}
            scoreDifference={tailoredResult.scoreDifference}
            resumeName={tailoredResult.resumeName}
            position={tailoredResult.position}
            compact={true}
          />

          {/* 2. Unified Studio Sidebar Drawer Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col overflow-hidden h-[calc(100vh-270px)] lg:h-[calc(100vh-250px)]">
            {/* Top Navigation Tabs Header */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSideTab("skills")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSideTab === "skills"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Missing Skills</span>
                  {tailoredResult.suggestedSkills.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        activeSideTab === "skills"
                          ? "bg-white/20 text-white"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {tailoredResult.suggestedSkills.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSideTab("changes")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSideTab === "changes"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  <span>AI Changes</span>
                  {totalChangesCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        activeSideTab === "changes"
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {totalChangesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4">
              {activeSideTab === "skills" ? (
                <SuggestedSkillsReview
                  suggestedSkills={tailoredResult.suggestedSkills}
                  existingSkills={existingSkills}
                  confirmedSkills={confirmedSkills}
                  rejectedSkills={rejectedSkills}
                  onConfirmSkill={handleConfirmSkill}
                  onRejectSkill={handleRejectSkill}
                  onRecalculateWithSkills={handleRecalculate}
                  isUpdating={isRecalculating}
                />
              ) : (
                <TailorChangesList changes={tailoredResult.changes} />
              )}
            </div>

            {/* Docked Action Footer: Pinned cleanly outside the scrollable body */}
            {activeSideTab === "skills" && (hasPendingChanges || isRecalculating) && (
              <div className="shrink-0 border-t border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-indigo-100/50 p-3 sm:p-3.5 flex flex-col gap-2 shadow-md animate-in slide-in-from-bottom-2 duration-200 z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>
                        {confirmedSkills.length}{" "}
                        {confirmedSkills.length === 1 ? "Skill" : "Skills"} Staged for Tailoring
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Integrates skills into bullet points & refreshes ATS score
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isRecalculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Re-Tailoring Resume with Skills...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>✨ Re-Tailor Resume & Recalculate Score</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Page Resume Studio Comparison */}
        <div className="flex-1 min-w-0 w-full h-[calc(100vh-170px)] min-h-[640px] flex flex-col">
          <ResumeComparisonView
            originalResume={tailoredResult.originalResumeData}
            tailoredResume={tailoredResult.tailoredResumeData}
            resumeName={tailoredResult.resumeName}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
