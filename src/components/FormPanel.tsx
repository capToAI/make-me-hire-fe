"use client";

import type { ResumeState } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";
import { SectionCard } from "@/components/SectionCard";
import { Sparkles, Printer, PlusCircle } from "lucide-react";

export function FormPanel({
  state,
  dispatch,
}: {
  state: ResumeState;
  dispatch: (action: ResumeAction) => void;
}) {
  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_SECTIONS", fromIndex, toIndex })
  );

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      dispatch({ type: "REORDER_SECTIONS", fromIndex: index, toIndex: index - 1 });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < state.sectionOrder.length - 1) {
      dispatch({ type: "REORDER_SECTIONS", fromIndex: index, toIndex: index + 1 });
    }
  };

  return (
    <div className="no-print flex w-full flex-col bg-slate-50 lg:h-full lg:w-[480px] xl:w-[520px] lg:flex-shrink-0 lg:border-r lg:border-slate-200">
      {/* Top Bar Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Make My Resume
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Live Resume Editor
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Export / Print</span>
        </button>
      </div>

      {/* Sections Container */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
        {state.sectionOrder.map((sectionId, index) => {
          const section = state.sections[sectionId];
          if (!section) return null;
          return (
            <SectionCard
              key={section.id}
              section={section}
              dispatch={dispatch}
              dragHandleProps={getHandleProps(index)}
              cardDropProps={getCardProps(index)}
              isDragOver={overIndex === index}
              isFirst={index === 0}
              isLast={index === state.sectionOrder.length - 1}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          );
        })}

        {/* Add Custom Section Button */}
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_CUSTOM_SECTION" })}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 active:scale-[0.99]"
        >
          <PlusCircle className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <span>Add Custom Section</span>
        </button>
      </div>
    </div>
  );
}

