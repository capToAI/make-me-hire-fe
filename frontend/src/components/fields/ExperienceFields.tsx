"use client";

import { useState } from "react";
import type { ExperienceData, ExperienceEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass, smallButtonClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";
import { BulletListEditor } from "@/components/BulletListEditor";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Building2,
  Briefcase,
  Calendar,
  Plus,
} from "lucide-react";

export function ExperienceFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: ExperienceData;
  dispatch: (action: ResumeAction) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<ExperienceEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  return (
    <div className="space-y-4">
      {data.entries.map((entry, index) => {
        const isCollapsed = collapsed[entry.id];
        const label =
          [entry.role, entry.company].filter(Boolean).join(" @ ") ||
          "New position";

        return (
          <div
            key={entry.id}
            {...getCardProps(index)}
            className={`rounded-2xl border transition-all ${
              overIndex === index
                ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  {...getHandleProps(index)}
                  className="cursor-grab touch-none rounded-md p-1 text-slate-300 hover:bg-slate-200/60 hover:text-slate-600 active:cursor-grabbing transition-colors shrink-0"
                  title="Drag to reorder position"
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [entry.id]: !c[entry.id] }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 transition-transform" />
                  )}
                  <span className="truncate">{label}</span>
                </button>
              </div>

              {data.entries.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_ENTRY",
                      sectionId,
                      entryId: entry.id,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                  title="Remove position"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div className="space-y-4 border-t border-slate-200 bg-white p-4 sm:p-4.5 rounded-b-2xl">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Company
                    </label>
                    <input
                      className={inputClass}
                      value={entry.company}
                      onChange={(e) =>
                        updateEntry(entry.id, { company: e.target.value })
                      }
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      Role / Title
                    </label>
                    <input
                      className={inputClass}
                      value={entry.role}
                      onChange={(e) =>
                        updateEntry(entry.id, { role: e.target.value })
                      }
                      placeholder="Senior Engineer"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Start date
                    </label>
                    <input
                      className={inputClass}
                      value={entry.start}
                      onChange={(e) =>
                        updateEntry(entry.id, { start: e.target.value })
                      }
                      placeholder="Jan 2022"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      End date
                    </label>
                    <input
                      className={inputClass}
                      value={entry.end}
                      disabled={entry.current}
                      onChange={(e) =>
                        updateEntry(entry.id, { end: e.target.value })
                      }
                      placeholder="Present / Dec 2023"
                    />
                    <label className="mt-2.5 flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(e) =>
                          updateEntry(entry.id, { current: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      />
                      <span>Currently working here</span>
                    </label>
                  </div>
                </div>

                <BulletListEditor
                  sectionId={sectionId}
                  entryId={entry.id}
                  bullets={entry.bullets}
                  dispatch={dispatch}
                />
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_ENTRY", sectionId })}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs font-bold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="h-4 w-4 text-indigo-600" />
        <span>Add position</span>
      </button>
    </div>
  );
}

