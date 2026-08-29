"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileText, Loader2, Printer } from "lucide-react";
import { exportResumeToPdf } from "@/lib/pdfExport";
import type { ResumeState } from "@/lib/types";

interface ExportDropdownProps {
  state: ResumeState;
  pageFormat?: "letter" | "a4";
}

export function ExportDropdown({
  state,
  pageFormat = "letter",
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      setIsOpen(false);

      const basicSection = Object.values(state.sections).find(
        (s) => s.type === "basic"
      );
      const fullName =
        (basicSection?.data as { name?: string } | undefined)?.name?.trim() || "";
      const safeFileName = fullName
        ? `${fullName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`
        : "Resume.pdf";

      await exportResumeToPdf(pageFormat, safeFileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      // Fallback to print preview if canvas capture fails
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setIsOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Download Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-zinc-100/90 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-all hover:bg-zinc-200/80 active:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        title="Export or print your resume"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-700" />
        ) : (
          <Download className="h-3.5 w-3.5 text-zinc-700" />
        )}
        <span>{isExporting ? "Exporting…" : "Download"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-600 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-zinc-200/90 bg-white shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex flex-col">
            {/* PDF Option */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors text-left cursor-pointer border-b border-zinc-100 active:bg-zinc-100"
            >
              <FileText className="h-4 w-4 text-zinc-600 shrink-0" />
              <span>PDF</span>
            </button>

            {/* Print Option */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors text-left cursor-pointer active:bg-zinc-100"
            >
              <Printer className="h-4 w-4 text-zinc-600 shrink-0" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
