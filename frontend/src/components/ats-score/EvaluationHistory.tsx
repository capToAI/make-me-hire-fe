"use client";

import { useState } from "react";
import {
  Clock,
  Trash2,
  ChevronRight,
  Sparkles,
  History,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import type { AtsEvaluationRecord, AtsScoreData } from "@/lib/types";

interface EvaluationHistoryProps {
  history: AtsEvaluationRecord[];
  isLoading: boolean;
  selectedEvaluationId?: string;
  onSelectEvaluation: (evaluation: AtsEvaluationRecord) => void;
  onDeleteEvaluation: (id: string) => Promise<void>;
}

export function EvaluationHistory({
  history,
  isLoading,
  selectedEvaluationId,
  onSelectEvaluation,
  onDeleteEvaluation,
}: EvaluationHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this ATS evaluation from history?")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDeleteEvaluation(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <History className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Past ATS Checks ({history.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Saved in Database</span>
      </div>

      <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading evaluation history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <Briefcase className="h-6 w-6 mx-auto mb-1.5 text-slate-300" />
            No saved ATS evaluations yet for this resume. Check a job description above to save your first result!
          </div>
        ) : (
          history.map((item) => {
            const isSelected = selectedEvaluationId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectEvaluation(item)}
                className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/40 shadow-2xs"
                    : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getScoreColor(
                        item.score
                      )}`}
                    >
                      {item.score}%
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {item.jobTitle || "Target Role"}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                    {item.summary || item.jobDescription}
                  </p>

                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
                      {item.matchedKeywords?.length || 0} matched
                    </span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium">
                      {item.missingKeywords?.length || 0} missing
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Delete record"
                    disabled={deletingId === item.id}
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isSelected
                        ? "text-indigo-600 translate-x-0.5"
                        : "text-slate-300 group-hover:text-slate-500"
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
