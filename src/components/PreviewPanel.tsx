"use client";

import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
} from "lucide-react";
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

  // Resume document options & pagination state
  const [pageFormat, setPageFormat] = useState<PageFormat>("letter");
  const [pages, setPages] = useState<ResumeBlock[][]>([[]]);
  const [heightsMap, setHeightsMap] = useState<Record<string, number>>({});
  const [maxPageHeight, setMaxPageHeight] = useState<number>(930);

  // Zoom & responsive width state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [outerWidth, setOuterWidth] = useState<number>(800);

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

  // Step 3: Track available container width with ResizeObserver
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const updateWidth = () => {
      if (outer.clientWidth > 0) {
        setOuterWidth(outer.clientWidth);
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  // Calculate unscaled page dimensions
  const pageWidth = pageFormat === "letter" ? 816 : 794;
  const pageHeightPx = pageFormat === "letter" ? 1056 : 1123;
  const gapPx = 32;
  const numPages = Math.max(1, pages.length);
  const totalUnscaledHeight = pageHeightPx * numPages + gapPx * (numPages - 1);

  // Compute responsive auto-fit scale
  const paddingX = outerWidth < 640 ? 16 : 32;
  const usableWidth = Math.max(260, outerWidth - paddingX);
  const autoFitScale = Math.min(1.0, usableWidth / pageWidth);
  const scale = Math.max(0.2, autoFitScale * zoomLevel);

  const scaledWidth = Math.round(pageWidth * scale);
  const scaledHeight = Math.round(totalUnscaledHeight * scale);
  const pageClass = pageFormat === "letter" ? "resume-page-letter" : "resume-page-a4";

  // Handlers for zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, z + 0.1));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.4, z - 0.1));
  const handleZoomReset = () => setZoomLevel(1.0);

  return (
    <div ref={outerRef} className="flex-1 min-w-0 lg:h-full flex flex-col bg-zinc-200/90 overflow-hidden">
      {/* Toolbar / Header */}
      <div className="no-print bg-white border-b border-zinc-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-xs z-10 select-none">
        {/* Left Group: Page Format & Page Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">
              Format:
            </span>
            <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200">
              {(Object.keys(PAGE_FORMATS) as PageFormat[]).map((fmtKey) => {
                const isActive = pageFormat === fmtKey;
                return (
                  <button
                    key={fmtKey}
                    type="button"
                    onClick={() => setPageFormat(fmtKey)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {fmtKey.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
            <FileText className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              {numPages} {numPages === 1 ? "Page" : "Pages"}
            </span>
          </div>
        </div>

        {/* Right Group: Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg bg-zinc-100 p-0.5 border border-zinc-200">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-zinc-600 min-w-[42px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoomLevel !== 1.0 && (
              <button
                type="button"
                onClick={handleZoomReset}
                title="Reset Zoom"
                className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Scrollable Container */}
      <div className="preview-scroll flex-1 overflow-auto p-3 sm:p-6 lg:p-8 flex flex-col items-center">
        {/* Off-screen hidden measurement container */}
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
          <div
            style={{
              height: format.heightCss,
              padding: "0.65in",
              boxSizing: "border-box",
            }}
          >
            <div ref={sampleContentRef} style={{ height: "100%" }} />
          </div>

          {blocks.map((block) => (
            <div key={block.id} data-block-id={block.id} style={{ display: "flow-root" }}>
              <SingleBlockRenderer block={block} isTopOfPage={false} />
            </div>
          ))}
        </div>

        {/* Scaled Preview Outer Box */}
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
          className="preview-outer mx-auto relative transition-[width,height] duration-200 ease-out overflow-hidden print:static print:w-auto print:h-auto print:overflow-visible print:block"
        >
          {/* Scaled Transform Container */}
          <div
            style={{
              width: `${pageWidth}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="preview-scale absolute top-0 left-0 print:static print:w-auto print:transform-none print:block"
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
                    className={`resume-page ${pageClass} relative mx-auto bg-white p-[0.65in] shadow-xl border border-zinc-200/80 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-[0.65in] print:box-border print:overflow-hidden`}
                    style={{
                      width: format.widthCss,
                      height: format.heightCss,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      boxSizing: "border-box",
                    }}
                  >
                    <PageBlocksRenderer blocks={pageBlocks} />

                    <div className="no-print print:hidden absolute bottom-2.5 right-3.5 text-[10px] font-semibold text-zinc-400 select-none bg-zinc-100/80 px-2 py-0.5 rounded-full border border-zinc-200/60">
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


