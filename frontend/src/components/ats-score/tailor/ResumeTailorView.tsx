"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  Edit3,
  Loader2,
  Printer,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { TailoredResumeResponse } from "@/lib/types";
import { applyTailoredResume } from "@/lib/api";
import { exportResumeToPdf, printResumePages } from "@/lib/pdfExport";
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

  // Action states
  const [isApplying, setIsApplying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
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
  };

  const handleRejectSkill = (skillName: string) => {
    setRejectedSkills((prev) => Array.from(new Set([...prev, skillName])));
    setConfirmedSkills((prev) => prev.filter((s) => s !== skillName));
  };

  const handleRecalculate = async () => {
    setErrorMessage(null);
    try {
      await onRecalculateWithSkills(confirmedSkills, rejectedSkills);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update tailored resume";
      setErrorMessage(msg);
    }
  };

  const handleApplyTailoredResume = async (andEdit: boolean = false) => {
    setIsApplying(true);
    setErrorMessage(null);

    try {
      const res = await applyTailoredResume(
        tailoredResult.resumeId,
        tailoredResult.tailoredResumeData
      );

      if (res.success) {
        setApplySuccess(true);
        if (andEdit) {
          router.push(`/builder?id=${encodeURIComponent(tailoredResult.resumeId)}`);
        }
      } else {
        setErrorMessage(
          res.error || "Failed to save tailored changes. Please try again."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to apply tailored resume";
      setErrorMessage(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handlePrintTailored = () => {
    const container = document.getElementById("tailored-preview-container");
    const pages = container
      ? container.querySelectorAll<HTMLElement>(".resume-page")
      : document.querySelectorAll<HTMLElement>(".resume-page");
    if (pages.length > 0) {
      printResumePages(
        Array.from(pages),
        "letter",
        `${tailoredResult.resumeName} - Tailored Resume`
      );
    } else {
      window.print();
    }
  };

  const handleDownloadTailored = async () => {
    const container = document.getElementById("tailored-preview-container");
    setIsDownloading(true);
    try {
      await exportResumeToPdf(
        "letter",
        `${tailoredResult.resumeName.replace(/\s+/g, "_")}_Tailored.pdf`,
        container
      );
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Left: Discard / Return action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isApplying || isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Back to ATS Score</span>
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={isApplying || isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
            <span>Discard Changes</span>
          </button>
        </div>

        {/* Right: Export, Print, Apply & Continue Editing CTAs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Print Tailored Button */}
          <button
            type="button"
            onClick={handlePrintTailored}
            disabled={isApplying || isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Print Tailored Resume"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Print Tailored</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadTailored}
            disabled={isApplying || isRecalculating || isDownloading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Download Tailored Resume as PDF"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <Download className="h-4 w-4 text-slate-500" />
            )}
            <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyTailoredResume(true)}
            disabled={isApplying || isRecalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Edit3 className="h-4 w-4 text-slate-500" />
            <span className="hidden md:inline">Continue Editing</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyTailoredResume(false)}
            disabled={isApplying || isRecalculating || applySuccess}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
              applySuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
            }`}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Applying Changes...</span>
              </>
            ) : applySuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Applied to Resume!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Apply Tailored Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {applySuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Tailored Resume Applied Successfully!</p>
              <p className="text-emerald-700">
                Your resume &ldquo;{tailoredResult.resumeName}&rdquo; has been updated in your account with the reviewed tailored content.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/builder?id=${encodeURIComponent(tailoredResult.resumeId)}`)
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
          >
            <span>Open in Editor</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-rose-900">Tailoring Notice</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 1. Score Comparison Card */}
      <TailorScoreComparison
        originalScore={tailoredResult.originalScore}
        originalRank={tailoredResult.originalRank}
        tailoredScore={tailoredResult.tailoredScore}
        tailoredRank={tailoredResult.tailoredRank}
        scoreDifference={tailoredResult.scoreDifference}
        resumeName={tailoredResult.resumeName}
        position={tailoredResult.position}
      />

      {/* 2. Suggested Skills Review (Factual guardrail) */}
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

      {/* 3. Categorized Changes Breakdown */}
      <TailorChangesList changes={tailoredResult.changes} />

      {/* 4. Side-by-Side Resume Document Comparison */}
      <ResumeComparisonView
        originalResume={tailoredResult.originalResumeData}
        tailoredResume={tailoredResult.tailoredResumeData}
        resumeName={tailoredResult.resumeName}
      />
    </div>
  );
}
