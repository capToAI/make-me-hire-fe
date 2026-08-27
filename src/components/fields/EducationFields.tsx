"use client";

import type { EducationData, EducationEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass, smallButtonClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";

export function EducationFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: EducationData;
  dispatch: (action: ResumeAction) => void;
}) {
  const { getHandleProps, overIndex } = useDragReorder((fromIndex, toIndex) =>
    dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<EducationEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  return (
    <div className="space-y-3">
      {data.entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`rounded border border-zinc-200 p-3 ${
            overIndex === index ? "bg-zinc-50" : ""
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              {...getHandleProps(index)}
              className="cursor-grab select-none text-zinc-400"
              title="Drag to reorder"
            >
              ⠿
            </span>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                value={entry.degree}
                onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                placeholder="B.S. Computer Science"
              />
            </div>
            <div>
              <label className={labelClass}>Field / Institution</label>
              <input
                className={inputClass}
                value={entry.field}
                onChange={(e) => updateEntry(entry.id, { field: e.target.value })}
                placeholder="University of Example"
              />
            </div>
            <div>
              <label className={labelClass}>Start date</label>
              <input
                className={inputClass}
                value={entry.start}
                onChange={(e) => updateEntry(entry.id, { start: e.target.value })}
                placeholder="2018"
              />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input
                className={inputClass}
                value={entry.end}
                onChange={(e) => updateEntry(entry.id, { end: e.target.value })}
                placeholder="2022"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_ENTRY", sectionId })}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        + Add education
      </button>
    </div>
  );
}
