"use client";

import { useEffect, useRef } from "react";
import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";
import { GripVertical, Trash2, Plus } from "lucide-react";

function BulletTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.max(42, ref.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[42px] resize-none overflow-hidden shadow-2xs"
      rows={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

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
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Bullet points
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Tip: Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-mono font-semibold">**text**</code> for bold
        </span>
      </div>

      <div className="space-y-2.5">
        {bullets.map((bullet, index) => (
          <div
            key={index}
            {...getCardProps(index)}
            className={`group flex items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 transition-all ${
              overIndex === index
                ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm"
                : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50/80"
            }`}
          >
            <button
              type="button"
              {...getHandleProps(index)}
              className="mt-2 shrink-0 cursor-grab touch-none rounded-md p-1 text-slate-300 hover:bg-slate-200/60 hover:text-slate-600 active:cursor-grabbing transition-colors"
              title="Drag to reorder bullet point"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex-1 min-w-0">
              <BulletTextarea
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
            </div>

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
              className="mt-2 shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete bullet point"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_BULLET", sectionId, entryId })}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add bullet point</span>
      </button>
    </div>
  );
}


