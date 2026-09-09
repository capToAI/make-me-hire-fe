"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Sparkles, Tag, XCircle } from "lucide-react";

interface KeywordBadgeListProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export function KeywordBadgeList({
  matchedKeywords,
  missingKeywords,
  matchedSkills,
  missingSkills,
}: KeywordBadgeListProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (items: string[], label: string) => {
    try {
      await navigator.clipboard.writeText(items.join(", "));
      setCopiedSection(label);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // clipboard access might be restricted
    }
  };

  // Combine unique keywords and skills for clean display
  const combinedMatched = Array.from(
    new Set([...matchedSkills, ...matchedKeywords])
  );

  const matchedSetLower = new Set(
    combinedMatched.map((m) => m.toLowerCase().trim())
  );

  // Strictly exclude anything already matched from the missing list
  const combinedMissing = Array.from(
    new Set([...missingSkills, ...missingKeywords])
  ).filter((item) => !matchedSetLower.has(item.toLowerCase().trim()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Matched Keywords & Skills */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Matched Keywords & Skills
              </h3>
              <p className="text-[11px] text-slate-500">
                Found in both your resume and the job description
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {combinedMatched.length}
            </span>
            {combinedMatched.length > 0 && (
              <button
                type="button"
                onClick={() => copyToClipboard(combinedMatched, "matched")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy all matched keywords"
              >
                {copiedSection === "matched" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedSection === "matched" ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>

        {combinedMatched.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {combinedMatched.map((kw, i) => {
              const isSkill = matchedSkills.includes(kw);
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all hover:scale-105 ${
                    isSkill
                      ? "border-emerald-300 bg-white text-emerald-800 font-bold"
                      : "border-emerald-200 bg-emerald-100/60 text-emerald-700"
                  }`}
                >
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>{kw}</span>
                  {isSkill && (
                    <span className="ml-0.5 rounded-sm bg-emerald-100 px-1 py-0.2 text-[9px] font-black uppercase text-emerald-800">
                      Skill
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-slate-500 italic">
            No exact keyword matches found with this job description.
          </p>
        )}
      </div>

      {/* 2. Missing Keywords & Skills */}
      <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Missing Keywords & Skills
              </h3>
              <p className="text-[11px] text-slate-500">
                High-priority terms in job posting missing in your resume
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
              {combinedMissing.length}
            </span>
            {combinedMissing.length > 0 && (
              <button
                type="button"
                onClick={() => copyToClipboard(combinedMissing, "missing")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy all missing keywords"
              >
                {copiedSection === "missing" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedSection === "missing" ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>

        {combinedMissing.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {combinedMissing.map((kw, i) => {
              const isSkill = missingSkills.includes(kw);
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all hover:scale-105 ${
                    isSkill
                      ? "border-rose-300 bg-white text-rose-800 font-bold"
                      : "border-rose-200 bg-rose-100/60 text-rose-700"
                  }`}
                >
                  <Tag className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>{kw}</span>
                  {isSkill && (
                    <span className="ml-0.5 rounded-sm bg-rose-100 px-1 py-0.2 text-[9px] font-black uppercase text-rose-800">
                      Req
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-emerald-700 font-medium">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 text-emerald-600" />
            Exceptional keyword coverage! No critical missing keywords detected.
          </p>
        )}
      </div>
    </div>
  );
}
