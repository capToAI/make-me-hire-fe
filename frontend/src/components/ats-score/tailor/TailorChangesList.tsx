"use client";

import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  KeyRound,
  Wrench,
  ChevronDown,
} from "lucide-react";
import type { TailorChangesGroup } from "@/lib/types";

interface TailorChangesListProps {
  changes: TailorChangesGroup;
}

type TabType = "all" | "summary" | "experience" | "keywords" | "skills";

export function TailorChangesList({ changes }: TailorChangesListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const summaryCount = changes.summary?.length || 0;
  const experienceCount = changes.experience?.length || 0;
  const keywordsCount = changes.keywords?.length || 0;
  const skillsCount = changes.skills?.length || 0;
  const totalCount = summaryCount + experienceCount + keywordsCount + skillsCount;

  const categories = [
    {
      id: "summary" as const,
      label: "Professional Summary",
      icon: FileText,
      items: changes.summary || [],
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "experience" as const,
      label: "Work Experience",
      icon: Briefcase,
      items: changes.experience || [],
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      id: "keywords" as const,
      label: "Target Keywords",
      icon: KeyRound,
      items: changes.keywords || [],
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "skills" as const,
      label: "Skills & Technologies",
      icon: Wrench,
      items: changes.skills || [],
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((cat) => cat.id === activeTab);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Tailoring Modifications ({totalCount})
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent breakdown of every refinement made to optimize ATS alignment.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Summary ({summaryCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "experience"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Experience ({experienceCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("keywords")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "keywords"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Keywords ({keywordsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "skills"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Skills ({skillsCount})
          </button>
        </div>
      </div>

      {/* Changes Grouped by Category */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          if (cat.items.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {cat.label} ({cat.items.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.title}
                          </h5>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.impact && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">ATS Impact:</span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {item.impact}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
