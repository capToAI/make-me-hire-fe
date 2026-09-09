"use client";

import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  FolderGit2,
  KeyRound,
  Wrench,
} from "lucide-react";
import type { TailorChangesGroup } from "@/lib/types";

interface TailorChangesListProps {
  changes: TailorChangesGroup;
}

type TabType = "all" | "summary" | "experience" | "projects" | "keywords" | "skills";

export function TailorChangesList({ changes }: TailorChangesListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const summaryCount = changes.summary?.length || 0;
  const experienceCount = changes.experience?.length || 0;
  const projectsCount = changes.projects?.length || 0;
  const keywordsCount = changes.keywords?.length || 0;
  const skillsCount = changes.skills?.length || 0;
  const totalCount = summaryCount + experienceCount + projectsCount + keywordsCount + skillsCount;

  const categories = [
    {
      id: "summary" as const,
      label: "Summary",
      icon: FileText,
      items: changes.summary || [],
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "experience" as const,
      label: "Experience",
      icon: Briefcase,
      items: changes.experience || [],
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      id: "projects" as const,
      label: "Projects",
      icon: FolderGit2,
      items: changes.projects || [],
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "keywords" as const,
      label: "Keywords",
      icon: KeyRound,
      items: changes.keywords || [],
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "skills" as const,
      label: "Skills",
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
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="space-y-2.5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Tailoring Modifications ({totalCount})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of refinements made to optimize your ATS alignment.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "experience"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Experience ({experienceCount})
          </button>
          {projectsCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "projects"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Projects ({projectsCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("keywords")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
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
      <div className="space-y-4">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          if (cat.items.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded-md border ${cat.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  {cat.label} ({cat.items.length})
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900">
                            {item.title}
                          </h5>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.impact && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">ATS Impact:</span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
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
