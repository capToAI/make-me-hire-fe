"use client";

import Link from "next/link";
import { FilePlus2, FileText } from "lucide-react";
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
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100/80"
          />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center">
        <p className="text-xs text-slate-500">
          No saved resumes found. Create or import your resume first.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span>Create Resume</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {resumes.map((resume) => {
        const isSelected = selectedResumeId === resume.id;
        return (
          <button
            key={resume.id}
            type="button"
            onClick={() => onSelectResume(resume)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
              isSelected
                ? "border-indigo-300 bg-indigo-50/80 text-indigo-700 shadow-2xs font-semibold ring-1 ring-indigo-400/30"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FileText
              className={`h-4 w-4 shrink-0 ${
                isSelected ? "text-indigo-600" : "text-slate-400"
              }`}
            />
            <span className="truncate max-w-[200px]">
              {resume.name || "Untitled Resume"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

