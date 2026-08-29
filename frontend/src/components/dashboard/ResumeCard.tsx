"use client";

import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Clock,
  Edit3,
  FileText,
  Trash2,
} from "lucide-react";
import type { ResumeListItem } from "@/lib/types";

interface ResumeCardProps {
  resume: ResumeListItem;
  onDeleteClick: (resume: ResumeListItem) => void;
}

export function ResumeCard({ resume, onDeleteClick }: ResumeCardProps) {
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Header Badges */}
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100/80">
            <Briefcase className="h-3 w-3 text-indigo-600" />
            <span className="truncate max-w-[180px] sm:max-w-[220px]">
              {resume.position || "General"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(resume.updatedAt)}</span>
          </span>
        </div>

        {/* Resume Icon & Name */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
              {resume.name || "Untitled Resume"}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              Target Role: <span className="text-slate-700 font-semibold">{resume.position || "Not specified"}</span>
            </p>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-4">
          <Calendar className="h-3 w-3" />
          <span>
            Created {new Date(resume.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
        <Link
          href={`/builder?id=${encodeURIComponent(resume.id)}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit Resume</span>
        </Link>

        <button
          type="button"
          onClick={() => onDeleteClick(resume)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 transition-all cursor-pointer"
          title="Delete this resume"
          aria-label={`Delete ${resume.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
