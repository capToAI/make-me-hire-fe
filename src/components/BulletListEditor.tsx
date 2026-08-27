"use client";

import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";

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
  const { getHandleProps, overIndex } = useDragReorder((fromIndex, toIndex) =>
    dispatch({ type: "REORDER_BULLETS", sectionId, entryId, fromIndex, toIndex })
  );

  return (
    <div className="space-y-1.5">
      <label className="mb-1 block text-xs font-medium text-zinc-600">
        Bullet points
      </label>
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className={`flex items-start gap-1.5 rounded ${
            overIndex === index ? "bg-zinc-100" : ""
          }`}
        >
          <span
            {...getHandleProps(index)}
            className="mt-2 cursor-grab select-none text-zinc-400"
            title="Drag to reorder"
          >
            ⠿
          </span>
          <textarea
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
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
            placeholder="Describe an achievement or responsibility…"
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
            className="mt-1 text-zinc-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_BULLET", sectionId, entryId })}
        className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
      >
        + Add bullet
      </button>
    </div>
  );
}
