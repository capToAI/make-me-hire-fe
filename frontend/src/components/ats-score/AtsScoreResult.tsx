"use client";

import { useMemo } from "react";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import type { AtsScoreData } from "@/lib/types";

interface AtsScoreResultProps {
  result: AtsScoreData;
  onTailorResume: () => void;
  isTailoring?: boolean;
  onReset?: () => void;
  onSelectDifferentResume?: () => void;
}

export function AtsScoreResult({
  result,
  onTailorResume,
  isTailoring = false,
}: AtsScoreResultProps) {
  // Combine unique keywords and skills for clean display
  const combinedMatched = useMemo(() => {
    return Array.from(
      new Set([...(result.matchedSkills || []), ...(result.matchedKeywords || [])])
    );
  }, [result.matchedSkills, result.matchedKeywords]);

  const combinedMissing = useMemo(() => {
    const matchedSetLower = new Set(
      combinedMatched.map((m) => m.toLowerCase().trim())
    );
    return Array.from(
      new Set([...(result.missingSkills || []), ...(result.missingKeywords || [])])
    ).filter((item) => !matchedSetLower.has(item.toLowerCase().trim()));
  }, [result.missingSkills, result.missingKeywords, combinedMatched]);

  const scoreColor = useMemo(() => {
    if (result.score >= 75) return "text-emerald-600";
    if (result.score >= 50) return "text-amber-500";
    return "text-rose-600";
  }, [result.score]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Score and Keywords Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            Your ATS Match Score for {result.resumeName || "Selected Resume"}{" "}
            {result.position ? `(${result.position})` : ""}
          </h2>

          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-5xl sm:text-6xl font-black tracking-tight ${scoreColor}`}>
              {result.score}
            </span>
            <span className="text-2xl font-bold text-slate-400">/100</span>
          </div>
        </div>

        {/* Matched Keywords Section */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
            <span>Matched keywords ({combinedMatched.length})</span>
          </div>

          {combinedMatched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {combinedMatched.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No matching keywords identified in this resume.
            </p>
          )}
        </div>

        {/* Missing Keywords Section */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <X className="h-4 w-4 text-rose-500 stroke-[2.5]" />
            <span>Missing keywords ({combinedMissing.length})</span>
          </div>

          {combinedMissing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {combinedMissing.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">
              Excellent match! No critical keywords missing.
            </p>
          )}
        </div>
      </div>

      {/* 2. "Want a higher score?" Tailoring Callout Banner */}
      <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-blue-50/30 to-indigo-50/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm sm:text-base">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Want a higher score?</span>
          </div>
          <p className="text-xs text-slate-600 max-w-md leading-relaxed">
            Let AI rewrite your resume around this job description, truthfully, and watch the score climb.
          </p>
        </div>

        <button
          type="button"
          onClick={onTailorResume}
          disabled={isTailoring}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <span>Tailor for this Job</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
