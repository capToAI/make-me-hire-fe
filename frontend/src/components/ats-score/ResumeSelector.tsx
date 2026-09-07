"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  FilePlus2,
  FileText,
  Search,
} from "lucide-react";
import type { ResumeListItem } from "@/lib/types";

interface ResumeSelectorProps {
  resumes: ResumeListItem[];
  selectedResumeId: string | null;
  onSelectResume: (resume: ResumeListItem) => void;
  isLoading?: boolean;
}

export function ResumeSelector({
  resumes,
  selectedResumeId,
  onSelectResume,
  isLoading = false,
}: ResumeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResumes = useMemo(() => {
    if (!searchQuery.trim()) return resumes;
    const q = searchQuery.toLowerCase();
    return resumes.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.position && r.position.toLowerCase().includes(q))
    );
  }, [resumes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70 p-4"
          />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          No Saved Resumes Found
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-slate-500">
          You need at least one saved resume to run an ATS score check. Create or import your resume in the builder first.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Create New Resume</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.length > 3 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by name or position..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      )}

      <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
        {filteredResumes.map((resume) => {
          const isSelected = selectedResumeId === resume.id;
          return (
            <div
              key={resume.id}
              onClick={() => onSelectResume(resume)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectResume(resume);
                }
              }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-150 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-900">
                    {resume.name || "Untitled Resume"}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium truncate max-w-[200px]">
                      <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{resume.position || "General"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-3 shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-slate-300 group-hover:border-slate-400" />
                )}
              </div>
            </div>
          );
        })}

        {filteredResumes.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-500">
            No resumes match &ldquo;{searchQuery}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
