"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeState, Section } from "@/lib/types";
import { sectionHasContent } from "@/lib/emptyChecks";
import { SectionRenderer } from "./preview/SectionRenderer";

export function PreviewPanel({ state }: { state: ResumeState }) {
  // Measuring outerRef (not the scrollable element itself) keeps the scale
  // calculation independent of the scrollbar that scaling/content growth
  // can introduce on the scrollable element — otherwise the scrollbar
  // appearing/disappearing changes clientWidth, which changes scale, which
  // changes content height, which toggles the scrollbar again forever.
  const outerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const page = pageRef.current;
    if (!outer || !page) return;

    const update = () => {
      const availableWidth = outer.clientWidth - 32;
      const nextScale = Math.min(1, availableWidth / page.offsetWidth);
      setScale((prev) => (Math.abs(prev - nextScale) < 0.001 ? prev : nextScale));
      setPageHeight((prev) =>
        Math.abs(prev - page.offsetHeight) < 1 ? prev : page.offsetHeight
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(page);
    return () => ro.disconnect();
    // Intentionally run once: ResizeObserver reacts to the DOM nodes'
    // actual box size (which changes as resume content grows/shrinks) on
    // its own, so it doesn't need to be tied to `state`. Recreating the
    // observer on every keystroke caused runaway re-renders.
  }, []);

  const visibleSections = state.sectionOrder
    .map((id) => state.sections[id])
    .filter(
      (section): section is Section =>
        Boolean(section) && section.visible && sectionHasContent(section)
    );

  return (
    <div ref={outerRef} className="flex-1 min-w-0 lg:h-full">
      <div className="preview-scroll h-full overflow-auto bg-zinc-200 p-4 lg:p-8">
        <div
          style={{ height: pageHeight ? pageHeight * scale : undefined }}
          className="preview-outer mx-auto"
        >
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            className="preview-scale"
          >
            <div
              id="resume-page"
              ref={pageRef}
              className="mx-auto w-[8.5in] min-h-[11in] bg-white p-[0.65in] shadow-lg"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {visibleSections.length === 0 ? (
                <p className="text-center text-sm text-zinc-400">
                  Start filling in the form to see your resume take shape here.
                </p>
              ) : (
                visibleSections.map((section) => (
                  <SectionRenderer key={section.id} section={section} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
