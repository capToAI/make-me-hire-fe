"use client";

import { ArrowRight, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import type { AtsMatchRank } from "@/lib/types";

interface TailorScoreComparisonProps {
  originalScore: number;
  originalRank: AtsMatchRank;
  tailoredScore: number;
  tailoredRank: AtsMatchRank;
  scoreDifference: number;
  resumeName: string;
  position: string;
}

export function TailorScoreComparison({
  originalScore,
  originalRank,
  tailoredScore,
  tailoredRank,
  scoreDifference,
  resumeName,
  position,
}: TailorScoreComparisonProps) {
  const isImproved = scoreDifference > 0;
  const isUnchanged = scoreDifference === 0;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute -top-24 right-0 w-80 h-80 bg-gradient-to-br from-emerald-100/50 via-indigo-100/30 to-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left info */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI ATS Score Optimization</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ATS Score Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Targeting <span className="font-semibold text-slate-700">{position || "Target Role"}</span> for{" "}
            <span className="font-semibold text-slate-700">&ldquo;{resumeName}&rdquo;</span>
          </p>
        </div>

        {/* Score comparison blocks */}
        <div className="flex items-center gap-3 sm:gap-5 self-start md:self-auto">
          {/* Original score */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[110px] sm:min-w-[130px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Score
            </span>
            <div className="mt-1 flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-700">
                {originalScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {originalRank}
            </span>
          </div>

          {/* Arrow */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 shadow-2xs">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Tailored score */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/90 to-teal-50/70 px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[110px] sm:min-w-[130px] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Tailored Score
            </span>
            <div className="mt-1 flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {tailoredScore}
              </span>
              <span className="text-xs font-semibold text-emerald-600/70">/100</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              {tailoredRank}
            </span>
          </div>

          {/* Score difference badge */}
          <div className="flex flex-col items-center justify-center">
            {isImproved ? (
              <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-3.5 py-3 text-white shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm sm:text-base font-black tracking-tight">
                  +{scoreDifference}
                </span>
                <span className="hidden sm:inline text-xs font-medium text-emerald-100">
                  Points
                </span>
              </div>
            ) : isUnchanged ? (
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-200 px-3.5 py-3 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
                <span className="text-xs sm:text-sm font-bold">Optimized</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-2xl bg-rose-100 px-3.5 py-3 text-rose-700">
                <span className="text-sm font-bold">{scoreDifference} Points</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
