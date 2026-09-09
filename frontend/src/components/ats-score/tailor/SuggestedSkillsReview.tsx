"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Undo2,
  X,
  Zap,
} from "lucide-react";
import type { SuggestedSkill } from "@/lib/types";

interface SuggestedSkillsReviewProps {
  suggestedSkills: SuggestedSkill[];
  existingSkills: string[];
  confirmedSkills: string[];
  rejectedSkills: string[];
  onConfirmSkill: (skillName: string) => void;
  onRejectSkill: (skillName: string) => void;
  onRecalculateWithSkills?: () => void;
  isUpdating: boolean;
}

type FilterType = "all" | "pending" | "confirmed" | "skipped";

export function SuggestedSkillsReview({
  suggestedSkills,
  existingSkills,
  confirmedSkills,
  rejectedSkills,
  onConfirmSkill,
  onRejectSkill,
  isUpdating,
}: SuggestedSkillsReviewProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [showExistingSkills, setShowExistingSkills] = useState(false);

  const handleAddAllHighRelevance = () => {
    const highRelevancePending = suggestedSkills.filter(
      (s) => s.relevance === "high" && !confirmedSkills.includes(s.name)
    );
    highRelevancePending.forEach((s) => onConfirmSkill(s.name));
  };

  if (suggestedSkills.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-2xs">
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-emerald-900">Full Skill Coverage</p>
            <p className="text-emerald-700 mt-0.5">
              Your resume already covers all core technical competencies identified in the job description.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingSkills = suggestedSkills.filter(
    (s) => !confirmedSkills.includes(s.name) && !rejectedSkills.includes(s.name)
  );
  const confirmedCount = confirmedSkills.filter((name) =>
    suggestedSkills.some((s) => s.name === name)
  ).length;
  const rejectedCount = rejectedSkills.filter((name) =>
    suggestedSkills.some((s) => s.name === name)
  ).length;
  const pendingCount = pendingSkills.length;

  const highRelevancePendingCount = pendingSkills.filter(
    (s) => s.relevance === "high"
  ).length;

  const filteredSkills = suggestedSkills.filter((skill) => {
    const isConfirmed = confirmedSkills.includes(skill.name);
    const isRejected = rejectedSkills.includes(skill.name);

    if (filter === "pending") return !isConfirmed && !isRejected;
    if (filter === "confirmed") return isConfirmed;
    if (filter === "skipped") return isRejected;
    return true;
  });

  return (
    <div className="space-y-3.5">
      {/* Header & Guardrail Notice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
            <span>Factual Integrity Guardrail</span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {confirmedCount} selected · {pendingCount} to review
          </span>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Review Suggested Missing Skills
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Skills identified in the job description that were absent in your resume. Select the ones you genuinely have.
          </p>
        </div>

        {/* Quick Batch Actions & Filter Pills */}
        <div className="pt-0.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({suggestedSkills.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === "pending"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              To Review ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("confirmed")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === "confirmed"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Selected ({confirmedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("skipped")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === "skipped"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Skipped ({rejectedCount})
            </button>
          </div>

          {highRelevancePendingCount > 0 && (
            <button
              type="button"
              onClick={handleAddAllHighRelevance}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Select all high relevance skills for tailoring"
            >
              <Zap className="h-3 w-3" />
              <span>Select High Priority ({highRelevancePendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Active Updating Keywords Loader Banner */}
      {isUpdating && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/95 via-purple-50/90 to-blue-50/95 p-3.5 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  Re-Tailoring Resume with Selected Skills...
                </h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.2 rounded-full shrink-0 animate-pulse">
                  AI Re-Scoring
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Integrating selected skills into experience bullet points and updating score.
              </p>
              <div className="mt-2 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full animate-pulse w-4/5 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Skills Vertical Cards Stack */}
      <div className="flex flex-col gap-2.5">
        {filteredSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No skills in this filter tab.
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isConfirmed = confirmedSkills.includes(skill.name);
            const isRejected = rejectedSkills.includes(skill.name);

            return (
              <div
                key={skill.name}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                  isConfirmed
                    ? "border-indigo-300 bg-indigo-50/40 shadow-2xs"
                    : isRejected
                    ? "border-slate-200 bg-slate-50/70 opacity-65"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {/* Header: Skill Name & Relevance Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 tracking-tight break-words">
                        {skill.name}
                      </span>
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-800 shrink-0">
                          <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                          <span>Staged for Tailoring</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 shrink-0">
                          Skipped
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {skill.reason}
                    </p>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap ${
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

                {/* Actions Footer */}
                <div className="mt-3 flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                  {isConfirmed ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3 text-indigo-600" />
                        <span>Ready to be added to resume</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRejectSkill(skill.name)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Deselect skill"
                      >
                        <Undo2 className="h-3 w-3" />
                        <span>Deselect</span>
                      </button>
                    </div>
                  ) : isRejected ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Skill skipped
                      </span>
                      <button
                        type="button"
                        onClick={() => onConfirmSkill(skill.name)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Add Back</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => onConfirmSkill(skill.name)}
                        disabled={isUpdating}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all cursor-pointer shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>+ I Have This Skill</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRejectSkill(skill.name)}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-1.5 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Skip this skill"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Skip</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collapsible Verified Original Skills Accordion */}
      {existingSkills.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExistingSkills(!showExistingSkills)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-700">
              Verified Original Skills ({existingSkills.length})
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>{showExistingSkills ? "Hide" : "Show"}</span>
              {showExistingSkills ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </button>

          {showExistingSkills && (
            <div className="p-3 pt-0 border-t border-slate-200/60 flex flex-wrap gap-1 mt-2">
              {existingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
