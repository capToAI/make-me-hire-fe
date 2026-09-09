"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

const LOADING_STEPS = [
  "Parsing candidate resume sections and verified competencies...",
  "Extracting core requirements from target job description...",
  "Comparing keyword density and technological stack alignment...",
  "Calculating ATS score and formulating actionable recommendations...",
];

export function AtsLoadingState() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-white p-8 sm:p-12 text-center shadow-md animate-in fade-in duration-300">
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-90 shadow-md flex items-center justify-center text-white">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
        AI ATS Screening In Progress
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-slate-500">
        Our dedicated AI agent is evaluating your resume against the target job requirements using industry ATS parsing algorithms.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3 text-left">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-600" />
          <p className="text-xs sm:text-sm font-semibold text-indigo-900 animate-in fade-in duration-200">
            {LOADING_STEPS[currentStepIndex]}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {LOADING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx <= currentStepIndex ? "bg-indigo-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <span>Strict zero-mutation: Your saved resume remains untouched</span>
      </div>
    </div>
  );
}
