"use client";

import type { ResumeState } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";
import { SectionCard } from "@/components/SectionCard";

export function FormPanel({
  state,
  dispatch,
}: {
  state: ResumeState;
  dispatch: (action: ResumeAction) => void;
}) {
  const { getHandleProps, overIndex } = useDragReorder((fromIndex, toIndex) =>
    dispatch({ type: "REORDER_SECTIONS", fromIndex, toIndex })
  );

  return (
    <div className="no-print flex w-full flex-col overflow-y-auto bg-zinc-50 lg:h-full lg:w-[480px] lg:flex-shrink-0 lg:border-r lg:border-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <h1 className="text-base font-bold text-zinc-800">Make My Resume</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Export / Print
        </button>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {state.sectionOrder.map((sectionId, index) => {
          const section = state.sections[sectionId];
          if (!section) return null;
          return (
            <SectionCard
              key={section.id}
              section={section}
              dispatch={dispatch}
              dragHandleProps={getHandleProps(index)}
              isDragOver={overIndex === index}
            />
          );
        })}

        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_CUSTOM_SECTION" })}
          className="w-full rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
        >
          + Add custom section
        </button>
      </div>
    </div>
  );
}
