"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { AtsScoreData } from "@/lib/types";
import { ScoreOverview } from "./ScoreOverview";
import { KeywordBadgeList } from "./KeywordBadgeList";
import { AtsFeedbackList } from "./AtsFeedbackList";

interface AtsScoreResultProps {
  result: AtsScoreData;
  onReset: () => void;
  onSelectDifferentResume: () => void;
  onTailorResume: () => void;
  isTailoring?: boolean;
}

export function AtsScoreResult({
  result,
  onReset,
  onSelectDifferentResume,
  onTailorResume,
  isTailoring = false,
}: AtsScoreResultProps) {
  const onClickPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectDifferentResume}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Select Another Resume</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            <span>New Job Analysis</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClickPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <Link
            href={`/builder?id=${encodeURIComponent(result.resumeId)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="h-4 w-4 text-slate-500" />
            <span>Edit in Builder</span>
          </Link>

          {/* Primary Action: Tailor Resume */}
          <button
            type="button"
            onClick={onTailorResume}
            disabled={isTailoring}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-indigo-200" />
            <span>Tailor Resume for This Job</span>
          </button>
        </div>
      </div>

      {/* 1. Overall Score Overview */}
      <ScoreOverview
        score={result.score}
        rank={result.rank}
        summary={result.summary}
        resumeName={result.resumeName}
        position={result.position}
        analyzedAt={result.analyzedAt}
      />

      {/* Quick Tailoring Callout Banner */}
      <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Boost Your ATS Score with Tailoring
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
              Align your professional summary, highlight relevant skills, and optimize keywords specifically for this role without altering your authentic experience.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTailorResume}
          disabled={isTailoring}
          className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>Tailor Resume for This Job</span>
        </button>
      </div>

      {/* 2. Keyword & Skill Breakdown */}
      <KeywordBadgeList
        matchedKeywords={result.matchedKeywords}
        missingKeywords={result.missingKeywords}
        matchedSkills={result.matchedSkills}
        missingSkills={result.missingSkills}
      />

      {/* 3. Strengths, Improvements, Recommendations */}
      <AtsFeedbackList
        strengths={result.strengths}
        improvements={result.improvements}
        recommendations={result.recommendations}
      />
    </div>
  );
}
