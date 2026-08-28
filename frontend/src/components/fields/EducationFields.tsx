"use client";

import type { EducationData, EducationEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";
import { GripVertical, GraduationCap, Building, Calendar, Trash2, Plus } from "lucide-react";

export function EducationFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: EducationData;
  dispatch: (action: ResumeAction) => void;
}) {
  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<EducationEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  return (
    <div className="space-y-4">
      {data.entries.map((entry, index) => (
        <div
          key={entry.id}
          {...getCardProps(index)}
          className={`rounded-2xl border transition-all ${
            overIndex === index
              ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4 border-b border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                {...getHandleProps(index)}
                className="cursor-grab touch-none rounded-md p-1 text-slate-300 hover:bg-slate-200/60 hover:text-slate-600 active:cursor-grabbing transition-colors shrink-0"
                title="Drag to reorder education"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="truncate text-sm font-bold text-slate-800">
                {[entry.degree, entry.field].filter(Boolean).join(" • ") || "Education Entry"}
              </span>
            </div>

            {data.entries.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "REMOVE_ENTRY", sectionId, entryId: entry.id })
                }
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                title="Remove education"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-4.5 bg-white rounded-b-2xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  Degree / Qualification
                </label>
                <input
                  className={inputClass}
                  value={entry.degree}
                  onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                  placeholder="B.S. Computer Science"
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  School / University
                </label>
                <input
                  className={inputClass}
                  value={entry.field}
                  onChange={(e) => updateEntry(entry.id, { field: e.target.value })}
                  placeholder="University of California, Berkeley"
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
                  onChange={(e) => updateEntry(entry.id, { start: e.target.value })}
                  placeholder="2018"
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
                  onChange={(e) => updateEntry(entry.id, { end: e.target.value })}
                  placeholder="2022"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_ENTRY", sectionId })}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs font-bold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="h-4 w-4 text-indigo-600" />
        <span>Add education</span>
      </button>
    </div>
  );
}

