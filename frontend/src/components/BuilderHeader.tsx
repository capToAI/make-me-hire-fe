"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";

interface BuilderHeaderProps {
  resumeName?: string;
  position?: string;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  saveNow?: () => void;
}

export function BuilderHeader({
  resumeName,
  position,
  saveStatus,
  saveNow,
}: BuilderHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="no-print h-14 w-full shrink-0 border-b border-slate-200 bg-white px-3 sm:px-5 flex items-center justify-between gap-3 z-30 select-none">
      {/* Left Group: Logo, Back Link, Resume Title, Role Badge, Save Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0 group"
          title="Return to Dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            MakeMeHire
          </span>
        </Link>

        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          title="Return to Dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <h1
            className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-slate-900 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[360px]"
            title={resumeName || "Untitled Resume"}
          >
            {resumeName || "Untitled Resume"}
          </h1>

          {position && position !== "General" && (
            <span
              className="hidden md:inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 truncate max-w-[160px] lg:max-w-[240px]"
              title={position}
            >
              {position}
            </span>
          )}
        </div>

        {/* Save Status Badge */}
        {saveStatus === "saving" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-indigo-100 shrink-0">
            <RefreshCw className="h-3 w-3 animate-spin text-indigo-600" />
            <span className="hidden sm:inline">Saving…</span>
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-100 shrink-0">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Saved to cloud</span>
          </span>
        )}
        {saveStatus === "error" && (
          <button
            type="button"
            onClick={saveNow}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
            title="Click to retry saving"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>Retry Save</span>
          </button>
        )}
      </div>

      {/* Right Group: ATS Check & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/ats-score"
          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer"
          title="Check ATS score"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden sm:inline">ATS Check</span>
        </Link>
        {session?.user && <UserMenu user={session.user} />}
      </div>
    </header>
  );
}
