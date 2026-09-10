"use client";

import { useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  FileText,
  RotateCcw,
} from "lucide-react";
import { renderFormattedText } from "@/lib/renderFormattedText";

export interface ProjectRefineModalProps {
  isOpen: boolean;
  projectName?: string;
  oldBullets: string[];
  newBullets: string[];
  onUseNewBullets: () => void;
  onKeepOriginal: () => void;
}

export function ProjectRefineModal({
  isOpen,
  projectName,
  oldBullets,
  newBullets,
  onUseNewBullets,
  onKeepOriginal,
}: ProjectRefineModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onKeepOriginal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onKeepOriginal]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-refine-modal-title"
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="project-refine-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900"
                >
                  Review AI-Refined Bullets
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-extrabold text-purple-700">
                  AI Polish
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {projectName
                  ? `Polished bullet points for "${projectName}"`
                  : "Compare your original bullet points with the AI refined version."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onKeepOriginal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close without changes (Escape)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Comparison Panels */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel 1: Original Bullets */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Current Bullets
                  </span>
                </div>
                <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {oldBullets.length} points
                </span>
              </div>

              <ul className="flex-1 space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 select-text font-normal list-disc pl-4">
                {oldBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <div className="mt-4 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Original version</span>
                <span>Unchanged</span>
              </div>
            </div>

            {/* Panel 2: AI Refined Bullets */}
            <div className="flex flex-col rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-purple-50/20 p-4 relative shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-200/70 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    AI Refined Bullets
                  </span>
                </div>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                  {newBullets.length} points
                </span>
              </div>

              <ul className="flex-1 space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-900 select-text font-normal list-disc pl-4">
                {newBullets.map((b, i) => (
                  <li key={i}>{renderFormattedText(b)}</li>
                ))}
              </ul>

              <div className="mt-4 pt-2.5 border-t border-indigo-200/70 text-[11px] text-indigo-700 font-medium flex items-center justify-between">
                <span>Optimized with action verbs & bold highlights</span>
                <span className="font-semibold text-indigo-600">Ready to Apply</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onKeepOriginal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Keep Original</span>
          </button>

          <button
            type="button"
            onClick={onUseNewBullets}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Apply AI Refined Bullets</span>
          </button>
        </div>
      </div>
    </div>
  );
}
