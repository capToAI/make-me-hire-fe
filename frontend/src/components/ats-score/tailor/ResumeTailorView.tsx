"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import type { TailoredResumeResponse } from "@/lib/types";
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
  // Local state for staged skills to add
  const [stagedSkills, setStagedSkills] = useState<string[]>([]);
  const [isJobDescExpanded, setIsJobDescExpanded] = useState(false);
  const [isChangesExpanded, setIsChangesExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract tailored skills from tailoredResumeData for the matched keywords list
  const matchedKeywords = useMemo(() => {
    const tailoredSkillsSection = Object.values(
      tailoredResult.tailoredResumeData.sections || {}
    ).find((sec) => sec.type === "skills");

    const skillsItems: string[] = Array.isArray(
      (tailoredSkillsSection?.data as any)?.items
    )
      ? (tailoredSkillsSection?.data as any).items
      : [];

    const changeKeywords = (tailoredResult.changes?.keywords || []).map(
      (k) => k.title
    );

    const positionWords = tailoredResult.position
      ? [tailoredResult.position]
      : [];

    return Array.from(
      new Set([...positionWords, ...skillsItems, ...changeKeywords])
    ).filter(Boolean);
  }, [tailoredResult]);

  // Missing skills from suggestedSkills
  const missingSkills = useMemo(() => {
    return (tailoredResult.suggestedSkills || []).map((s) => s.name);
  }, [tailoredResult.suggestedSkills]);

  // Toggle staging of a missing skill
  const handleToggleSkill = (skillName: string) => {
    setStagedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  // Trigger recalculation with staged skills
  const handleRegenerate = async () => {
    if (stagedSkills.length === 0) return;
    setErrorMessage(null);
    try {
      const rejected = missingSkills.filter((s) => !stagedSkills.includes(s));
      await onRecalculateWithSkills(stagedSkills, rejected);
      setStagedSkills([]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to recalculate tailored score";
      setErrorMessage(msg);
    }
  };

  // Predicted score calculation when keywords are staged
  const stagedCount = stagedSkills.length;
  const estimatedGain = stagedCount * 5;
  const predictedScore = Math.min(100, tailoredResult.tailoredScore + estimatedGain);

  const totalChangesCount =
    (tailoredResult.changes?.summary?.length || 0) +
    (tailoredResult.changes?.experience?.length || 0) +
    (tailoredResult.changes?.keywords?.length || 0) +
    (tailoredResult.changes?.skills?.length || 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Tailor for <span className="text-indigo-600">Job</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Paste a job description to see your ATS match score and the keywords you are missing, then tailor your resume around them.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Return to Score</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-rose-900">Tailoring Notice</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2-Column Split: Inspector / Controls (Left) & Single Resume PDF Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Controls, Score & Skills Review */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Collapsible Job Description Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsJobDescExpanded(!isJobDescExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isJobDescExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Job Description
                </span>
                {tailoredResult.position && (
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[160px]">
                    · {tailoredResult.position}
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                {isJobDescExpanded ? "Hide" : "Edit / View"}
              </span>
            </button>

            {isJobDescExpanded && (
              <div className="p-4 pt-0 border-t border-slate-100 space-y-2 mt-2">
                <textarea
                  readOnly
                  value={jobDescription}
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-700 select-all"
                />
                <div className="text-[11px] text-slate-400 text-right font-mono">
                  {jobDescription.length.toLocaleString()} characters
                </div>
              </div>
            )}
          </div>

          {/* 2. ATS Match Score Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                ATS Match Score
              </h2>

              {/* Score Progression Comparison */}
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-slate-400">Base</span>
                  <span className="text-xl font-bold text-slate-600">
                    {tailoredResult.originalScore}
                  </span>
                </div>

                <span className="text-slate-400 font-bold">→</span>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-indigo-700">Tailored</span>
                  <span className="text-3xl font-black text-indigo-600">
                    {tailoredResult.tailoredScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/100</span>
                  <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    +{tailoredResult.scoreDifference}
                  </span>
                </div>

                {/* Staged Score Gain Preview */}
                {stagedCount > 0 && (
                  <div className="flex items-baseline gap-1.5 animate-in fade-in duration-150">
                    <span className="text-xs text-slate-400">After regenerating</span>
                    <span className="text-lg font-bold text-emerald-600">
                      ~{predictedScore}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      (+{estimatedGain})
                    </span>
                  </div>
                )}
              </div>

              {/* Score Dual-Tone Progress Bar */}
              <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {/* Original Score Bar */}
                <div
                  style={{ width: `${tailoredResult.originalScore}%` }}
                  className="h-full bg-slate-700 transition-all duration-500"
                />
                {/* Tailored Gain Bar */}
                <div
                  style={{ width: `${tailoredResult.scoreDifference}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                />
                {/* Potential Extra Gain from Staged Skills */}
                {stagedCount > 0 && (
                  <div
                    style={{ width: `${Math.min(estimatedGain, 100 - tailoredResult.tailoredScore)}%` }}
                    className="h-full bg-indigo-400/80 animate-pulse transition-all duration-300"
                  />
                )}
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                <span>Matched keywords ({matchedKeywords.length})</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                {matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords (Interactive Selection) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
                  <X className="h-4 w-4 text-rose-500 stroke-[2.5]" />
                  <span>Missing keywords ({missingSkills.length})</span>
                </div>
                {stagedCount > 0 && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {stagedCount} selected
                  </span>
                )}
              </div>

              {missingSkills.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((skill, i) => {
                      const isStaged = stagedSkills.includes(skill);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                            isStaged
                              ? "border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold shadow-2xs ring-1 ring-indigo-400/40"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{skill}</span>
                          {isStaged ? (
                            <X className="h-3 w-3 text-indigo-600" />
                          ) : (
                            <Check className="h-3 w-3 text-slate-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Tick the keywords you genuinely have and we will add them into the tailored resume.
                  </p>

                  {/* Regenerate Action Button */}
                  {stagedCount > 0 && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={isRecalculating}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRecalculating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Regenerating Tailored Resume...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>
                              Regenerate Tailored Resume ({stagedCount})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">
                  All critical job keywords have been matched!
                </p>
              )}
            </div>
          </div>

          {/* 3. AI Changes & Optimizations Summary (Collapsible) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsChangesExpanded(!isChangesExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  AI Optimizations Summary
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {totalChangesCount}
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {isChangesExpanded ? "Hide" : "View"}
              </span>
            </button>

            {isChangesExpanded && (
              <div className="p-4 pt-0 border-t border-slate-100 space-y-3 max-h-72 overflow-y-auto text-xs text-slate-600 mt-2">
                {tailoredResult.changes?.summary?.map((ch, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="font-bold text-slate-800">{ch.title}</p>
                    <p className="text-slate-600 mt-0.5">{ch.description}</p>
                  </div>
                ))}

                {tailoredResult.changes?.experience?.map((ch, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="font-bold text-slate-800">{ch.title}</p>
                    <p className="text-slate-600 mt-0.5">{ch.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Single Canvas PDF Preview with [Tailored] and [Base Resume] Tabs */}
        <div className="lg:col-span-7 h-[calc(100vh-170px)] min-h-[640px] flex flex-col">
          <ResumeComparisonView
            originalResume={tailoredResult.originalResumeData}
            tailoredResume={tailoredResult.tailoredResumeData}
            resumeName={tailoredResult.resumeName}
            resumeId={tailoredResult.resumeId}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
