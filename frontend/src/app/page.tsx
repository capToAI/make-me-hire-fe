"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { UserMenu } from "@/components/auth/UserMenu";
import { GoogleAuthCard } from "@/components/auth/GoogleAuthCard";
import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";
import { ResumeListDashboard } from "@/components/dashboard/ResumeListDashboard";
import { CreateResumeModal } from "@/components/dashboard/CreateResumeModal";

const STORAGE_KEY = "resume-draft";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"blank" | "import">("blank");

  // Check URL query parameters for NextAuth error flags on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");

      if (errorParam) {
        let msg = "An error occurred while authenticating. Please try again.";
        if (
          errorParam === "OAuthSignin" ||
          errorParam === "OAuthCallback" ||
          errorParam === "Callback"
        ) {
          msg =
            "Google sign-in was cancelled or encountered an issue. Please try signing in again.";
        } else if (errorParam === "AccessDenied") {
          msg =
            "Access was denied. Please sign in with an authorized Google account.";
        } else if (errorParam === "SignInRequired") {
          msg =
            "Please sign in with Google to access the resume builder.";
        }
        // Clean URL parameters gracefully
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        setTimeout(() => setAuthError(msg), 0);
      }
    }
  }, []);

  // 1. Handle "Create From Scratch"
  const handleCreateFromScratch = () => {
    setCreateModalMode("blank");
    setIsCreateModalOpen(true);
  };

  // 2. Validate PDF file
  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setErrorMessage(
        "Only PDF documents (.pdf) are supported. Please select a valid PDF file."
      );
      setSelectedFile(null);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        "The selected file exceeds the 10MB limit. Please choose a smaller PDF."
      );
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
      setTimeout(
        () => setExtractionStep("Analyzing resume structure with AI…"),
        2800
      ),
      setTimeout(
        () => setExtractionStep("Populating live editor components…"),
        4500
      )
    );

    try {
      const result = await extractResumeFromPdf(selectedFile);

      stepTimers.forEach(clearTimeout);

      if (!result.success || !result.data) {
        setErrorMessage(
          result.error ||
            "Failed to extract resume content. Please verify the PDF format and try again."
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
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during extraction.";
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

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-blue-100/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[350px] bg-gradient-to-bl from-indigo-100/40 via-purple-100/30 to-transparent blur-[90px] rounded-full pointer-events-none" />

      {/* Header / Navigation Bar */}
      <header className="relative z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-2xs">
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
            {isLoading ? (
              <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
            ) : isAuthenticated && session?.user ? (
              <>
                <UserMenu user={session.user} />
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalMode("blank");
                    setIsCreateModalOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs transition-all hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer"
                >
                  <FilePlus2 className="h-4 w-4" />
                  <span>New Resume</span>
                </button>
              </>
            ) : null}
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

        {/* Authentication Notice Banner */}
        {authError && (
          <div className="max-w-3xl mx-auto w-full mb-8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm shadow-sm">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-900">Authentication Notice</p>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-amber-500 hover:text-amber-700 p-1 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Global Extraction Error Banner */}
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

        {/* Action Area: Authentication-Dependent */}
        {isLoading ? (
          /* Loading State: Shimmer skeleton to prevent card flashing */
          <AuthLoadingSkeleton />
        ) : !isAuthenticated ? (
          /* Unauthenticated State: Show only Continue with Google */
          <GoogleAuthCard />
        ) : (
          /* Authenticated State: Show Resume List Dashboard */
          <div className="w-full animate-in fade-in duration-300">
            <ResumeListDashboard
              onOpenCreateBlank={() => {
                setCreateModalMode("blank");
                setIsCreateModalOpen(true);
              }}
              onOpenImport={() => {
                setCreateModalMode("import");
                setIsCreateModalOpen(true);
              }}
            />
          </div>
        )}

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

      {/* Global Create Resume Modal */}
      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialMode={createModalMode}
      />
    </div>
  );
}
