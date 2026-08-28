"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UploadCloud,
  FileText,
  FilePlus2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  X,
  ShieldCheck,
  Zap,
  Layers,
  FileCode2,
} from "lucide-react";
import { extractResumeFromPdf } from "@/lib/api";
import { createDefaultResume } from "@/lib/defaultResume";

const STORAGE_KEY = "resume-draft";

export default function LandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Handle "Create From Scratch"
  const handleCreateFromScratch = () => {
    try {
      const defaultResume = createDefaultResume();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultResume));
    } catch {
      // LocalStorage access issues fallback gracefully
    }
    router.push("/builder");
  };

  // 2. Validate PDF file
  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF documents (.pdf) are supported. Please select a valid PDF file.");
      setSelectedFile(null);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("The selected file exceeds the 10MB limit. Please choose a smaller PDF.");
      setSelectedFile(null);
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExtracting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isExtracting) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  // 3. Handle "Import Resume" Upload & Extraction
  const handleImportResume = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a resume PDF file to upload.");
      return;
    }

    if (isExtracting) return; // Prevent duplicate extraction requests

    setIsExtracting(true);
    setErrorMessage(null);
    setExtractionStep("Uploading PDF document…");

    const stepTimers: NodeJS.Timeout[] = [];
    stepTimers.push(
      setTimeout(() => setExtractionStep("Extracting and parsing text…"), 1200),
      setTimeout(() => setExtractionStep("Analyzing resume structure with AI…"), 2800),
      setTimeout(() => setExtractionStep("Populating live editor components…"), 4500)
    );

    try {
      const result = await extractResumeFromPdf(selectedFile);

      stepTimers.forEach(clearTimeout);

      if (!result.success || !result.data) {
        setErrorMessage(
          result.error || "Failed to extract resume content. Please verify the PDF format and try again."
        );
        setIsExtracting(false);
        setExtractionStep("");
        return;
      }

      // Save normalized extracted resume to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      } catch {
        // storage fallback
      }

      // Navigate to the editor
      router.push("/builder");
    } catch (err: unknown) {
      stepTimers.forEach(clearTimeout);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during extraction.";
      setErrorMessage(msg);
      setIsExtracting(false);
      setExtractionStep("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-blue-100/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[350px] bg-gradient-to-bl from-indigo-100/40 via-purple-100/30 to-transparent blur-[90px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MakeMeHire
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Resume Builder
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateFromScratch}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 cursor-pointer"
            >
              Open Editor
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-5 shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            <span>Smart AI Resume Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Build Your Perfect Resume{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              In Minutes
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose how you want to begin. Upload your existing resume for instant AI extraction and formatting, or start with a fresh blank canvas.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full mb-8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-900">Extraction Error</p>
                <p className="text-xs sm:text-sm text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Two Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto w-full items-stretch">
          {/* Card 1: Import Resume */}
          <div className="relative group flex flex-col justify-between rounded-2xl border-2 border-indigo-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all duration-300">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                  Recommended
                </span>
                <span className="text-xs font-semibold text-slate-400">PDF Upload</span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Import Resume</h2>
                  <p className="text-xs text-slate-500 font-medium">AI-powered extraction from PDF</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                Upload your existing PDF resume. Our AI agent extracts your contact info, experience, education, and skills directly into the editor.
              </p>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isExtracting}
                className="hidden"
                id="resume-pdf-upload"
              />

              {!selectedFile ? (
                <div
                  onClick={() => !isExtracting && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/70 scale-[1.01]"
                      : "border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/30"
                  }`}
                >
                  <FileText className={`h-8 w-8 ${isDragging ? "text-indigo-600" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      {isDragging ? "Drop your PDF here" : "Click to browse or drag & drop"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  {!isExtracting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Choose a different file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Processing State or Action Button */}
            <div className="mt-6">
              {isExtracting ? (
                <div className="w-full rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                  <div className="flex items-center justify-center gap-2.5 text-indigo-700 font-bold text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>{extractionStep || "Processing resume…"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Please wait while AI parses and normalizes your data</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={selectedFile ? handleImportResume : () => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{selectedFile ? "Extract & Load Into Editor" : "Select PDF Resume"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Create From Scratch */}
          <div className="relative group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  <FilePlus2 className="h-3 w-3 text-slate-500" />
                  Blank Canvas
                </span>
                <span className="text-xs font-semibold text-slate-400">Manual Entry</span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                  <FilePlus2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create From Scratch</h2>
                  <p className="text-xs text-slate-500 font-medium">Step-by-step guided builder</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Start with a structured, ATS-compliant blank resume template. Add your personal details, work history, projects, and skills at your own pace.
              </p>

              {/* Feature check list */}
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Standardized ATS sections & customizable order</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Live multi-device desktop & mobile preview</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Instant high-quality Letter & A4 PDF export</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateFromScratch}
                disabled={isExtracting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-slate-800 active:bg-slate-950 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Start Blank Resume</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">100% Private</p>
              <p className="text-[11px] text-slate-500 font-medium">In-browser local storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Zap className="h-5 w-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">AI Extraction</p>
              <p className="text-[11px] text-slate-500 font-medium">Fast structured parsing</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Layers className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Live Preview</p>
              <p className="text-[11px] text-slate-500 font-medium">Letter & A4 pagination</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <FileCode2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">ATS Friendly</p>
              <p className="text-[11px] text-slate-500 font-medium">Optimized for scanners</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MakeMeHire — Free Live Resume Builder & PDF Generator</span>
          <span>Fast, accurate, and ATS-compliant resume creation</span>
        </div>
      </footer>
    </div>
  );
}
