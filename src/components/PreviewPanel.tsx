"use client";

import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import type { ResumeState } from "@/lib/types";
import {
  flattenStateToBlocks,
  paginateBlocks,
  PAGE_FORMATS,
  PageFormat,
  ResumeBlock,
} from "@/lib/pagination";
import {
  SingleBlockRenderer,
  PageBlocksRenderer,
} from "./preview/BlockRenderer";

export function PreviewPanel({ state }: { state: ResumeState }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const sampleContentRef = useRef<HTMLDivElement>(null);

  const [pageFormat, setPageFormat] = useState<PageFormat>("letter");
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<ResumeBlock[][]>([[]]);
  const [heightsMap, setHeightsMap] = useState<Record<string, number>>({});
  const [maxPageHeight, setMaxPageHeight] = useState<number>(930);

  const format = PAGE_FORMATS[pageFormat];
  const blocks = useMemo(() => flattenStateToBlocks(state), [state]);

  // Step 1: Measure blocks off-screen whenever blocks or pageFormat change
  useLayoutEffect(() => {
    if (!measureRef.current || !sampleContentRef.current) return;

    // Measure printable area height
    const printableHeight = sampleContentRef.current.clientHeight || 930;
    setMaxPageHeight(printableHeight);

    // Measure block heights
    const newHeights: Record<string, number> = {};
    const elements = measureRef.current.querySelectorAll("[data-block-id]");
    elements.forEach((el) => {
      const id = el.getAttribute("data-block-id");
      if (id) {
        newHeights[id] = el.getBoundingClientRect().height;
      }
    });

    setHeightsMap(newHeights);
  }, [blocks, pageFormat]);

  // Step 2: Compute paginated pages whenever blocks, heightsMap, or maxPageHeight change
  useEffect(() => {
    if (blocks.length === 0) {
      setPages([[]]);
      return;
    }

    const computedPages = paginateBlocks(blocks, heightsMap, maxPageHeight);
    setPages(computedPages);
  }, [blocks, heightsMap, maxPageHeight]);

  // Step 3: Handle responsive scale calculation
  useEffect(() => {
    const outer = outerRef.current;
    const container = containerRef.current;
    if (!outer || !container) return;

    const update = () => {
      const availableWidth = outer.clientWidth - 32;
      const firstPage = container.querySelector(".resume-page") as HTMLElement;
      const pageWidth = firstPage ? firstPage.offsetWidth : (pageFormat === "letter" ? 816 : 794);
      const nextScale = Math.min(1, availableWidth / pageWidth);
      setScale((prev) => (Math.abs(prev - nextScale) < 0.001 ? prev : nextScale));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    if (container) ro.observe(container);
    return () => ro.disconnect();
  }, [pageFormat, pages.length]);

  // Calculate unscaled height based on exact page dimensions
  const pageHeightPx = pageFormat === "letter" ? 1056 : 1123;
  const gapPx = 32;
  const numPages = Math.max(1, pages.length);
  const totalUnscaledHeight = pageHeightPx * numPages + gapPx * (numPages - 1);
  const totalScaledHeight = totalUnscaledHeight * scale;
  const pageClass = pageFormat === "letter" ? "resume-page-letter" : "resume-page-a4";

  return (
    <div ref={outerRef} className="flex-1 min-w-0 lg:h-full flex flex-col bg-zinc-200">
      {/* Toolbar / Header */}
      <div className="no-print bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Page Format:
          </span>
          <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200">
            {(Object.keys(PAGE_FORMATS) as PageFormat[]).map((fmtKey) => {
              const fmt = PAGE_FORMATS[fmtKey];
              const isActive = pageFormat === fmtKey;
              return (
                <button
                  key={fmtKey}
                  type="button"
                  onClick={() => setPageFormat(fmtKey)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {fmtKey.toUpperCase()} ({fmt.id === "letter" ? "8.5×11 in" : "A4"})
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-medium text-zinc-500">
          {numPages} {numPages === 1 ? "Page" : "Pages"}
        </div>
      </div>

      {/* Main Scrollable Container */}
      <div className="preview-scroll flex-1 overflow-auto p-4 lg:p-8">
        {/* Hidden measurement container */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none fixed -left-[9999px] -top-[9999px] opacity-0"
          style={{
            width: format.widthCss,
            padding: "0.65in",
            fontFamily: "Arial, Helvetica, sans-serif",
            boxSizing: "border-box",
          }}
        >
          {/* Sample page printable area measurement */}
          <div
            style={{
              height: format.heightCss,
              padding: "0.65in",
              boxSizing: "border-box",
            }}
          >
            <div ref={sampleContentRef} style={{ height: "100%" }} />
          </div>

          {/* Render individual blocks for height measurement */}
          {blocks.map((block) => (
            <div key={block.id} data-block-id={block.id} style={{ display: "flow-root" }}>
              <SingleBlockRenderer block={block} isTopOfPage={false} />
            </div>
          ))}
        </div>

        {/* Scaled Preview Wrapper */}
        <div
          style={{ height: totalScaledHeight }}
          className="preview-outer mx-auto transition-[height] duration-200 ease-out"
        >
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            className="preview-scale"
          >
            <div ref={containerRef} className="flex flex-col items-center space-y-8 print:space-y-0 print:block">
              {blocks.length === 0 ? (
                <div
                  id="resume-page"
                  className={`resume-page ${pageClass} mx-auto bg-white p-[0.65in] shadow-lg flex items-center justify-center print:shadow-none print:m-0`}
                  style={{
                    width: format.widthCss,
                    height: format.heightCss,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    boxSizing: "border-box",
                  }}
                >
                  <p className="text-center text-sm text-zinc-400">
                    Start filling in the form to see your resume take shape here.
                  </p>
                </div>
              ) : (
                pages.map((pageBlocks, pageIndex) => (
                  <div
                    key={pageIndex}
                    id={pageIndex === 0 ? "resume-page" : undefined}
                    className={`resume-page ${pageClass} relative mx-auto bg-white p-[0.65in] shadow-lg overflow-hidden print:shadow-none print:m-0 print:p-[0.65in] print:box-border print:overflow-hidden`}
                    style={{
                      width: format.widthCss,
                      height: format.heightCss,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      boxSizing: "border-box",
                    }}
                  >
                    <PageBlocksRenderer blocks={pageBlocks} />

                    <div className="no-print print:hidden absolute bottom-2 right-3 text-[10px] font-medium text-zinc-400 select-none">
                      Page {pageIndex + 1} of {pages.length}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
