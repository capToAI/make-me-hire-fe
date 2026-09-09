"use client";

import { useMemo } from "react";
import { Award, Briefcase, Calendar, CheckCircle, FileText } from "lucide-react";
import type { AtsMatchRank } from "@/lib/types";

interface ScoreOverviewProps {
  score: number;
  rank: AtsMatchRank;
  summary: string;
  resumeName: string;
  position: string;
  analyzedAt: string;
}

export function ScoreOverview({
  score,
  rank,
  summary,
  resumeName,
  position,
  analyzedAt,
}: ScoreOverviewProps) {
  // SVG circular progress calculation
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorConfig = useMemo(() => {
    if (score >= 85) {
      return {
        text: "text-emerald-600",
        stroke: "stroke-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        lightBg: "from-emerald-50/50",
      };
    }
    if (score >= 70) {
      return {
        text: "text-indigo-600",
        stroke: "stroke-indigo-600",
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        lightBg: "from-indigo-50/50",
      };
    }
    if (score >= 55) {
      return {
        text: "text-blue-600",
        stroke: "stroke-blue-500",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        lightBg: "from-blue-50/50",
      };
    }
    if (score >= 40) {
      return {
        text: "text-amber-600",
        stroke: "stroke-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        lightBg: "from-amber-50/50",
      };
    }
    return {
      text: "text-rose-600",
      stroke: "stroke-rose-500",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      lightBg: "from-rose-50/50",
    };
  }, [score]);

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-gradient-to-b ${colorConfig.lightBg} via-white to-white p-6 sm:p-8 shadow-xs`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Prominent Circular Gauge */}
        <div className="flex items-center gap-6">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background Track */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="11"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className={`${colorConfig.stroke} transition-all duration-1000 ease-out`}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Score Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-black tracking-tight ${colorConfig.text}`}>
                {score}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${colorConfig.badgeBg}`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>{rank}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              ATS Compatibility Match
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>{resumeName}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                <span>{position}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(analyzedAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Summary Box */}
        <div className="w-full md:max-w-md rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur-xs shadow-2xs">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-900">
            <CheckCircle className="h-4 w-4 text-indigo-600" />
            <span>Executive Evaluation Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
