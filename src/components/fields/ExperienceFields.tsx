"use client";

import { useState } from "react";
import type { ExperienceData, ExperienceEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass, smallButtonClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";
import { BulletListEditor } from "@/components/BulletListEditor";

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

  const { getHandleProps, overIndex } = useDragReorder((fromIndex, toIndex) =>
    dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<ExperienceEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  return (
    <div className="space-y-3">
      {data.entries.map((entry, index) => {
        const isCollapsed = collapsed[entry.id];
        const label = [entry.role, entry.company].filter(Boolean).join(" @ ") || "New position";
        return (
          <div
            key={entry.id}
            className={`rounded border border-zinc-200 p-3 ${
              overIndex === index ? "bg-zinc-50" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  {...getHandleProps(index)}
                  className="cursor-grab select-none text-zinc-400"
                  title="Drag to reorder"
                >
                  ⠿
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [entry.id]: !c[entry.id] }))
                  }
                  className="text-sm font-medium text-zinc-700"
                >
                  {isCollapsed ? "▶" : "▼"} {label}
                </button>
              </div>
              {data.entries.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "REMOVE_ENTRY", sectionId, entryId: entry.id })
                  }
                  className={smallButtonClass}
                >
                  Remove
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      className={inputClass}
                      value={entry.company}
                      onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <input
                      className={inputClass}
                      value={entry.role}
                      onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start date</label>
                    <input
                      className={inputClass}
                      value={entry.start}
                      onChange={(e) => updateEntry(entry.id, { start: e.target.value })}
                      placeholder="Jan 2022"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End date</label>
                    <input
                      className={inputClass}
                      value={entry.end}
                      disabled={entry.current}
                      onChange={(e) => updateEntry(entry.id, { end: e.target.value })}
                      placeholder="Dec 2023"
                    />
                    <label className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(e) =>
                          updateEntry(entry.id, { current: e.target.checked })
                        }
                      />
                      Currently working here
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
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        + Add position
      </button>
    </div>
  );
}
