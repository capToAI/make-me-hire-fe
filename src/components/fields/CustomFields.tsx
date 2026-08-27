"use client";

import { useState } from "react";
import type { CustomData, CustomEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";
import { BulletListEditor } from "@/components/BulletListEditor";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Heading,
  Subtitles,
  Calendar,
  Trash2,
  Plus,
} from "lucide-react";

export function CustomFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: CustomData;
  dispatch: (action: ResumeAction) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<CustomEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  return (
    <div className="space-y-3">
      {data.entries.map((entry, index) => {
        const isCollapsed = collapsed[entry.id];
        const label = entry.heading || "New entry";

        return (
          <div
            key={entry.id}
            {...getCardProps(index)}
            className={`rounded-xl border transition-all ${
              overIndex === index
                ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2 p-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <button
                  type="button"
                  {...getHandleProps(index)}
                  className="cursor-grab touch-none p-1 text-slate-300 hover:text-slate-600 active:cursor-grabbing"
                  title="Drag to reorder entry"
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [entry.id]: !c[entry.id] }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
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
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Remove entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div className="space-y-3 border-t border-slate-200 bg-white p-3 rounded-b-xl">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <Heading className="h-3.5 w-3.5 text-slate-400" />
                      Heading / Title
                    </label>
                    <input
                      className={inputClass}
                      value={entry.heading}
                      onChange={(e) =>
                        updateEntry(entry.id, { heading: e.target.value })
                      }
                      placeholder="Project or item title"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Subtitles className="h-3.5 w-3.5 text-slate-400" />
                      Subheading (optional)
                    </label>
                    <input
                      className={inputClass}
                      value={entry.subheading ?? ""}
                      onChange={(e) =>
                        updateEntry(entry.id, { subheading: e.target.value })
                      }
                      placeholder="Role, organization, or tech stack"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Start date (optional)
                    </label>
                    <input
                      className={inputClass}
                      value={entry.start ?? ""}
                      onChange={(e) =>
                        updateEntry(entry.id, { start: e.target.value })
                      }
                      placeholder="2023"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      End date (optional)
                    </label>
                    <input
                      className={inputClass}
                      value={entry.end ?? ""}
                      onChange={(e) =>
                        updateEntry(entry.id, { end: e.target.value })
                      }
                      placeholder="Present"
                    />
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
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
      >
        <Plus className="h-4 w-4 text-indigo-600" />
        Add entry
      </button>
    </div>
  );
}

