"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Printer,
  RotateCcw,
} from "lucide-react";
import type { AtsScoreData } from "@/lib/types";
import { ScoreOverview } from "./ScoreOverview";
import { KeywordBadgeList } from "./KeywordBadgeList";
import { AtsFeedbackList } from "./AtsFeedbackList";

interface AtsScoreResultProps {
  result: AtsScoreData;
  onReset: () => void;
  onSelectDifferentResume: () => void;
}

export function AtsScoreResult({
  result,
  onReset,
  onSelectDifferentResume,
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit in Builder</span>
          </Link>
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
