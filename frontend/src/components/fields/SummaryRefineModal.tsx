"use client";

import { useEffect, useMemo } from "react";
import {
  Sparkles,
  Check,
  X,
  FileText,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

export interface SummaryRefineModalProps {
  isOpen: boolean;
  oldSummary: string;
  newSummary: string;
  onUseNewSummary: () => void;
  onKeepOriginal: () => void;
}

/**
 * Modal dialog for reviewing and comparing the original summary with the AI-refined summary.
 */
export function SummaryRefineModal({
  isOpen,
  oldSummary,
  newSummary,
  onUseNewSummary,
  onKeepOriginal,
}: SummaryRefineModalProps) {
  // 1. Memos / derived metrics
  const oldWordCount = useMemo(() => {
    return oldSummary.trim() ? oldSummary.trim().split(/\s+/).length : 0;
  }, [oldSummary]);

  const newWordCount = useMemo(() => {
    return newSummary.trim() ? newSummary.trim().split(/\s+/).length : 0;
  }, [newSummary]);

  const wordDifference = newWordCount - oldWordCount;

  // 2. Effects - Handle keyboard Escape to dismiss/skip
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

  if (!isOpen) {
    return null;
  }

  // 3. Render
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-refine-modal-title"
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
                  id="summary-refine-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900"
                >
                  Review AI-Refined Summary
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-extrabold text-purple-700">
                  AI Polish
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare your original draft with the AI improved version before accepting.
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
            {/* Panel 1: Original Summary */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Current Summary
                  </span>
                </div>
                <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {oldWordCount} words
                </span>
              </div>

              <div className="flex-1 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap select-text font-normal">
                {oldSummary}
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Status: Unchanged</span>
                <span>Read-only</span>
              </div>
            </div>

            {/* Panel 2: AI Refined Summary */}
            <div className="flex flex-col rounded-xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-purple-50/20 p-4 relative shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-200/70 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    AI Refined Summary
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                    {wordDifference !== 0 && (
                      <TrendingUp className="h-3 w-3 text-indigo-600" />
                    )}
                    {newWordCount} words
                    {wordDifference !== 0 && (
                      <span className="text-[10px] text-indigo-600 font-medium">
                        ({wordDifference > 0 ? `+${wordDifference}` : wordDifference})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex-1 text-xs sm:text-sm leading-relaxed text-slate-900 whitespace-pre-wrap select-text font-normal">
                {newSummary}
              </div>

              <div className="mt-4 pt-2.5 border-t border-indigo-100 text-[11px] text-indigo-600/80 font-medium flex items-center justify-between">
                <span>Proposed replacement</span>
                <span className="font-bold text-indigo-700">Ready to apply</span>
              </div>
            </div>
          </div>

          {/* Value callout note */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[11px] text-slate-600 flex items-start gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mt-0.5">
              <ArrowRight className="h-3 w-3" />
            </div>
            <p className="leading-normal">
              Selecting <strong className="text-indigo-950 font-bold">Use New Summary</strong> will replace the summary in your editor. You can continue editing or formatting the text with bold syntax at any time.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50/80 px-5 py-3.5">
          <button
            type="button"
            onClick={onKeepOriginal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            <span>Keep Original / Skip</span>
          </button>

          <button
            type="button"
            onClick={onUseNewSummary}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Use New Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
