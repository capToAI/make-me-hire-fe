"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import type { SuggestedSkill } from "@/lib/types";

interface SuggestedSkillsReviewProps {
  suggestedSkills: SuggestedSkill[];
  existingSkills: string[];
  confirmedSkills: string[];
  rejectedSkills: string[];
  onConfirmSkill: (skillName: string) => void;
  onRejectSkill: (skillName: string) => void;
  onRecalculateWithSkills: () => void;
  isUpdating: boolean;
}

export function SuggestedSkillsReview({
  suggestedSkills,
  existingSkills,
  confirmedSkills,
  rejectedSkills,
  onConfirmSkill,
  onRejectSkill,
  onRecalculateWithSkills,
  isUpdating,
}: SuggestedSkillsReviewProps) {
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleConfirm = (name: string) => {
    onConfirmSkill(name);
    setHasPendingChanges(true);
  };

  const handleReject = (name: string) => {
    onRejectSkill(name);
    setHasPendingChanges(true);
  };

  if (suggestedSkills.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-emerald-900">Full Skill Coverage</p>
            <p className="text-emerald-700 mt-0.5">
              Your resume already includes all core technical competencies identified in the job description.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = suggestedSkills.filter(
    (s) => !confirmedSkills.includes(s.name) && !rejectedSkills.includes(s.name)
  ).length;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Factual Integrity Guardrail</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Review Suggested Missing Skills
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            The job description emphasizes the following skills that were not found in your original resume.
            To maintain factual integrity, <strong>only confirm skills you genuinely possess</strong>.
          </p>
        </div>

        {/* Recalculate CTA if user changed selections */}
        {(hasPendingChanges || isUpdating) && (
          <div className="shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setHasPendingChanges(false);
                onRecalculateWithSkills();
              }}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating Keywords & Score...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Update Resume with Approved Skills</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Prominent Active Updating Keywords Loader Banner */}
      {isUpdating && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 p-4 sm:p-5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Updating Keywords & Recalculating ATS Score...
                </h4>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-2.5 py-0.5 rounded-full animate-pulse">
                  Live AI Calculation
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Integrating your approved skills, tuning keyword density in the tailored resume, and recalculating ATS compatibility against the target job description.
              </p>
              {/* Dynamic Animated Progress Bar */}
              <div className="mt-2.5 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full animate-pulse w-4/5 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Skills Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {suggestedSkills.map((skill) => {
          const isConfirmed = confirmedSkills.includes(skill.name);
          const isRejected = rejectedSkills.includes(skill.name);

          return (
            <div
              key={skill.name}
              className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                isConfirmed
                  ? "border-emerald-300 bg-emerald-50/50 shadow-2xs"
                  : isRejected
                  ? "border-slate-200 bg-slate-50/60 opacity-60"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    {skill.name}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      skill.relevance === "high"
                        ? "bg-rose-100 text-rose-800"
                        : skill.relevance === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {skill.relevance} Relevance
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-normal line-clamp-2">
                  {skill.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleConfirm(skill.name)}
                  disabled={isUpdating}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-colors cursor-pointer ${
                    isConfirmed
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isConfirmed ? "Confirmed" : "I Have This"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReject(skill.name)}
                  disabled={isUpdating}
                  className={`inline-flex items-center justify-center gap-1 rounded-xl py-2 px-3 text-xs font-bold transition-colors cursor-pointer ${
                    isRejected
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                  title="Skip this skill"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{isRejected ? "Skipped" : "Skip"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Existing verified skills summary */}
      {existingSkills.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">
              Verified Original Skills ({existingSkills.length}):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {existingSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
