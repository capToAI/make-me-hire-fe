"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

const STAGES = [
  { label: "Analyzing current ATS evaluation results", duration: 2500 },
  { label: "Identifying keyword and competence alignment opportunities", duration: 3000 },
  { label: "Tailoring professional summary and experience bullet points", duration: 4000 },
  { label: "Extracting missing skills requiring candidate review", duration: 3000 },
  { label: "Calculating tailored ATS score and preparing comparison", duration: 3500 },
];

export function TailorProgressState() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const advance = (idx: number) => {
      if (idx < STAGES.length - 1) {
        timeoutId = setTimeout(() => {
          setCurrentStage(idx + 1);
          advance(idx + 1);
        }, STAGES[idx].duration);
      }
    };

    advance(0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-md text-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Icon with subtle pulse animation */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md relative">
        <Sparkles className="h-10 w-10 animate-pulse" />
        <div className="absolute inset-0 rounded-3xl bg-indigo-400 blur-lg opacity-40 -z-10 animate-pulse" />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Tailoring Resume for Job Description
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Our AI agent is enhancing alignment, refining bullet points, and checking ATS compatibility while preserving 100% of your factual history.
        </p>
      </div>

      {/* Progress Stages Checklist */}
      <div className="space-y-3 text-left max-w-md mx-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                isDone || isCurrent ? "opacity-100" : "opacity-40"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-indigo-600 animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span
                className={`text-xs ${
                  isCurrent
                    ? "font-bold text-slate-900"
                    : isDone
                    ? "text-slate-600 font-medium"
                    : "text-slate-400"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
