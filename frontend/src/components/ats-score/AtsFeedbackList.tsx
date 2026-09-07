"use client";

import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";

interface AtsFeedbackListProps {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export function AtsFeedbackList({
  strengths,
  improvements,
  recommendations,
}: AtsFeedbackListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Strengths */}
      <div className="rounded-2xl border border-emerald-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Key Strengths</h3>
              <p className="text-[11px] text-slate-500">Confirmed ATS advantages</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Areas for Improvement */}
      <div className="rounded-2xl border border-amber-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Improvement Gaps</h3>
              <p className="text-[11px] text-slate-500">Potential ATS filter risks</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Actionable Recommendations */}
      <div className="rounded-2xl border border-indigo-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommendations</h3>
              <p className="text-[11px] text-slate-500">Actionable steps to elevate rank</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {recommendations.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
