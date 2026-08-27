"use client";

import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";
import { GripVertical, Trash2, Plus } from "lucide-react";

export function BulletListEditor({
  sectionId,
  entryId,
  bullets,
  dispatch,
}: {
  sectionId: string;
  entryId: string;
  bullets: string[];
  dispatch: (action: ResumeAction) => void;
}) {
  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({
        type: "REORDER_BULLETS",
        sectionId,
        entryId,
        fromIndex,
        toIndex,
      })
  );

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        Bullet points
      </label>
      {bullets.map((bullet, index) => (
        <div
          key={index}
          {...getCardProps(index)}
          className={`group flex items-start gap-1.5 rounded-lg border p-1.5 transition-all ${
            overIndex === index
              ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
          }`}
        >
          <button
            type="button"
            {...getHandleProps(index)}
            className="mt-1.5 cursor-grab touch-none p-0.5 text-slate-300 hover:text-slate-600 active:cursor-grabbing"
            title="Drag to reorder bullet point"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <textarea
            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            rows={1}
            value={bullet}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_BULLET",
                sectionId,
                entryId,
                bulletIndex: index,
                text: e.target.value,
              })
            }
            placeholder="Describe an achievement or key responsibility…"
          />

          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "REMOVE_BULLET",
                sectionId,
                entryId,
                bulletIndex: index,
              })
            }
            aria-label="Remove bullet"
            className="mt-1 rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            title="Delete bullet point"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_BULLET", sectionId, entryId })}
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add bullet point
      </button>
    </div>
  );
}

