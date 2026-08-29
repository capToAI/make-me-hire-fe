"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  UploadCloud,
  X,
  FileCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { extractResumeFromPdf, createResumeRecord } from "@/lib/api";
import { createDefaultResume } from "@/lib/defaultResume";
import type { ResumeState } from "@/lib/types";

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "blank" | "import";
}

export function CreateResumeModal({
  isOpen,
  onClose,
  initialMode = "blank",
}: CreateResumeModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"blank" | "import">(initialMode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF documents (.pdf) are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // 1. Create Blank Resume
  const handleCreateBlank = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Creating new resume workspace…");

    try {
      const defaultData: ResumeState = createDefaultResume();
      const createRes = await createResumeRecord({
        name: "",
        position: "",
        data: defaultData,
      });

      if (!createRes.success || !createRes.data) {
        setErrorMessage(createRes.error || "Failed to create resume.");
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

      onClose();
      router.push(`/builder?id=${encodeURIComponent(createRes.data.id)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // 2. Import and Extract from PDF
  const handleImportPdf = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a PDF resume file to import.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Extracting candidate info with AI…");

    try {
      const extractRes = await extractResumeFromPdf(selectedFile);
      if (!extractRes.success || !extractRes.data) {
        setErrorMessage(extractRes.error || "Failed to extract resume from PDF.");
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

      setLoadingStep("Persisting extracted resume to database…");
      const createRes = await createResumeRecord({
        data: extractRes.data,
      });

      if (!createRes.success || !createRes.data) {
        setErrorMessage(createRes.error || "Failed to save new resume.");
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

      onClose();
      router.push(`/builder?id=${encodeURIComponent(createRes.data.id)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Create New Resume
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Name & role are automatically derived from your resume content
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setMode("blank");
              setErrorMessage(null);
            }}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "blank"
                ? "bg-white text-indigo-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            <span>Blank Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("import");
              setErrorMessage(null);
            }}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "import"
                ? "bg-white text-indigo-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Import from PDF</span>
          </button>
        </div>

        {/* Tab 1: Blank Canvas */}
        {mode === "blank" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Pre-filled standard ATS sections (Experience, Skills, Education)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Resume name & position automatically sync as you edit Personal Info</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automatic cloud saving to your account</span>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateBlank}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{loadingStep || "Creating resume…"}</span>
                </>
              ) : (
                <>
                  <span>Start Blank Resume</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Import PDF */}
        {mode === "import" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
              id="modal-pdf-file-upload"
            />

            {!selectedFile ? (
              <div
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/70"
                    : "border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <UploadCloud className="h-8 w-8 text-indigo-500" />
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Click to browse or drag & drop PDF resume
                </p>
                <p className="text-[11px] text-slate-400">
                  Our AI extracts your candidate name, position, and work history
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleImportPdf}
              disabled={isLoading || !selectedFile}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{loadingStep || "Extracting & creating…"}</span>
                </>
              ) : (
                <>
                  <span>{selectedFile ? "Extract & Load Into Editor" : "Select PDF Resume"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
