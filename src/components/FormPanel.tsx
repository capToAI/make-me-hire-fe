"use client";

import { useState, useEffect, useRef } from "react";
import type { ResumeState } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { useDragReorder } from "@/hooks/useDragReorder";
import { SectionCard } from "@/components/SectionCard";
import {
  Sparkles,
  Printer,
  PlusCircle,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  EyeOff,
} from "lucide-react";

export function FormPanel({
  state,
  dispatch,
}: {
  state: ResumeState;
  dispatch: (action: ResumeAction) => void;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    state.sectionOrder[0] || null
  );

  const prevOrderLengthRef = useRef(state.sectionOrder.length);

  // Reorder hook for section tabs
  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_SECTIONS", fromIndex, toIndex })
  );

  // Ensure activeSectionId is always valid
  useEffect(() => {
    // If a new section was added, automatically select it
    if (state.sectionOrder.length > prevOrderLengthRef.current) {
      const newSectionId = state.sectionOrder[state.sectionOrder.length - 1];
      if (newSectionId) {
        setActiveSectionId(newSectionId);
      }
    }
    prevOrderLengthRef.current = state.sectionOrder.length;

    // If current active section no longer exists (e.g. deleted), fallback to first section
    if (activeSectionId && !state.sections[activeSectionId]) {
      setActiveSectionId(state.sectionOrder[0] || null);
    } else if (!activeSectionId && state.sectionOrder.length > 0) {
      setActiveSectionId(state.sectionOrder[0]);
    }
  }, [state.sectionOrder, state.sections, activeSectionId]);

  const activeIndex = activeSectionId
    ? state.sectionOrder.indexOf(activeSectionId)
    : 0;

  const activeSection = activeSectionId ? state.sections[activeSectionId] : null;

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

  const handleBack = () => {
    if (activeIndex > 0) {
      setActiveSectionId(state.sectionOrder[activeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (activeIndex < state.sectionOrder.length - 1) {
      setActiveSectionId(state.sectionOrder[activeIndex + 1]);
    } else {
      window.print();
    }
  };

  return (
    <div className="no-print flex w-full flex-col bg-slate-50 lg:h-full lg:w-[480px] xl:w-[520px] lg:flex-shrink-0 lg:border-r lg:border-slate-200">
      {/* Top Bar Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3.5 backdrop-blur-md">
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

      {/* Section Tabs Header Grid */}
      <div className="border-b border-slate-200 bg-white p-3 sm:p-4 shadow-2xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resume Sections (Drag tabs to reorder)
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {activeIndex + 1} of {state.sectionOrder.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.sectionOrder.map((sectionId, index) => {
            const section = state.sections[sectionId];
            if (!section) return null;

            const isActive = sectionId === activeSectionId;
            const isDragOver = overIndex === index;

            return (
              <div
                key={section.id}
                {...getCardProps(index)}
                onClick={() => setActiveSectionId(section.id)}
                className={`group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-all cursor-pointer select-none ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-100/60 ring-2 ring-indigo-500/40 scale-[1.02] z-10"
                    : isActive
                    ? "border-purple-300 bg-purple-50/60 text-purple-950 shadow-xs ring-2 ring-purple-500/20 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-semibold"
                }`}
              >
                {/* Drag handle inside tab header */}
                <button
                  type="button"
                  {...getHandleProps(index)}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-grab text-slate-300 hover:text-slate-600 active:cursor-grabbing p-0.5 transition-colors shrink-0"
                  title="Drag tab to reorder section"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>

                {/* Number Badge */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {index + 1}
                </span>

                {/* Section Title */}
                <span className="min-w-0 flex-1 truncate text-xs">
                  {section.title}
                </span>

                {/* Visibility Badge if Hidden */}
                {!section.visible && (
                  <span
                    className="shrink-0 text-amber-600"
                    title="Section is hidden in preview"
                  >
                    <EyeOff className="h-3 w-3" />
                  </span>
                )}
              </div>
            );
          })}

          {/* Add Custom Section Tab Button */}
          <button
            type="button"
            onClick={() => dispatch({ type: "ADD_CUSTOM_SECTION" })}
            className="group flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-2 text-xs font-bold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 active:scale-[0.98] cursor-pointer"
            title="Add a new custom section tab"
          >
            <PlusCircle className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="truncate">+ Custom</span>
          </button>
        </div>
      </div>

      {/* Active Section Form Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeSection ? (
          <SectionCard
            section={activeSection}
            dispatch={dispatch}
            isFirst={activeIndex === 0}
            isLast={activeIndex === state.sectionOrder.length - 1}
            onMoveUp={() => handleMoveUp(activeIndex)}
            onMoveDown={() => handleMoveDown(activeIndex)}
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
            No active section selected
          </div>
        )}
      </div>

      {/* Bottom Stepper Bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 shadow-md">
        <button
          type="button"
          onClick={handleBack}
          disabled={activeIndex === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-semibold text-slate-400">
          Section {activeIndex + 1} of {state.sectionOrder.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:bg-slate-800 active:bg-slate-950 cursor-pointer"
        >
          <span>{activeIndex === state.sectionOrder.length - 1 ? "Print / Export" : "Next"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


