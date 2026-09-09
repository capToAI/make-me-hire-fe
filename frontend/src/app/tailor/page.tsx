"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  fetchResumeById,
  fetchUserResumes,
  tailorResume,
} from "@/lib/api";
import type {
  ResumeListItem,
  ResumeState,
  TailoredResumeResponse,
} from "@/lib/types";
import { UserMenu } from "@/components/auth/UserMenu";
import { ResumeSelector } from "@/components/ats-score/ResumeSelector";
import { JobDescriptionInput } from "@/components/ats-score/JobDescriptionInput";
import { PreviewPanel } from "@/components/PreviewPanel";
import { TailorProgressState } from "@/components/ats-score/tailor/TailorProgressState";
import { ResumeTailorView } from "@/components/ats-score/tailor/ResumeTailorView";

function TailorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);
  const [baseResumeData, setBaseResumeData] = useState<ResumeState | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isLoadingBaseResume, setIsLoadingBaseResume] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResponse | null>(null);

  const autoTailoredRef = useRef(false);

  const isAuthenticated = status === "authenticated";
  const isLoadingAuth = status === "loading";

  // 1. Fetch user resumes & handle auto-tailor handover
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setIsLoadingResumes(true);

    fetchUserResumes()
      .then(async (res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setResumes(res.data);

          // Check handover from query params or sessionStorage
          const paramResumeId = searchParams.get("resumeId");
          const sessionResumeId =
            typeof window !== "undefined"
              ? sessionStorage.getItem("tailor_target_resume_id")
              : null;
          const targetResumeId = paramResumeId || sessionResumeId;

          const paramJobDesc =
            typeof window !== "undefined"
              ? sessionStorage.getItem("tailor_target_job_desc")
              : "";

          if (paramJobDesc) {
            setJobDescription(paramJobDesc);
          }

          let activeResume: ResumeListItem | null = null;
          if (targetResumeId) {
            activeResume = res.data.find((r) => r.id === targetResumeId) || null;
          }
          if (!activeResume && res.data.length > 0) {
            activeResume = res.data[0];
          }

          setSelectedResume(activeResume);

          // Trigger Auto-Tailor if requested from Check ATS page
          const shouldAutoTailor =
            searchParams.get("autoTailor") === "true" ||
            (typeof window !== "undefined" &&
              sessionStorage.getItem("tailor_auto_start") === "true");

          if (
            shouldAutoTailor &&
            activeResume &&
            paramJobDesc &&
            paramJobDesc.trim().length >= 20 &&
            !autoTailoredRef.current
          ) {
            autoTailoredRef.current = true;
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("tailor_auto_start");
            }
            startTailoring(activeResume.id, paramJobDesc.trim());
          }
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingResumes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, searchParams]);

  // 2. Fetch Base Resume Data for preview when selected resume changes
  useEffect(() => {
    if (!selectedResume || tailoredResult) return;

    let isMounted = true;
    setIsLoadingBaseResume(true);

    fetchResumeById(selectedResume.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.data) {
          setBaseResumeData(res.data.data);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingBaseResume(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedResume, tailoredResult]);

  // 3. Start Tailoring process
  const startTailoring = async (resumeId: string, jobDesc: string) => {
    setIsTailoring(true);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await tailorResume(resumeId, jobDesc);

      if (res.success && res.data) {
        setTailoredResult(res.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(
          res.error || "Unable to complete resume tailoring. Please retry."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect to tailoring service";
      setErrorMessage(msg);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleManualTailor = () => {
    if (!selectedResume) {
      setErrorMessage("Please select one of your saved resumes to tailor.");
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage(
        "Please enter a complete job description (minimum 20 characters) for accurate resume tailoring."
      );
      return;
    }
    startTailoring(selectedResume.id, jobDescription.trim());
  };

  // 4. Handle Skill Recalculation
  const handleRecalculateWithSkills = async (
    confirmedSkills: string[],
    rejectedSkills: string[]
  ) => {
    if (!selectedResume || !jobDescription.trim()) return;

    setIsRecalculating(true);
    setErrorMessage(null);

    try {
      const res = await tailorResume(
        selectedResume.id,
        jobDescription.trim(),
        confirmedSkills,
        rejectedSkills
      );

      if (res.success && res.data) {
        setTailoredResult(res.data);
      } else {
        setErrorMessage(
          res.error || "Unable to update tailored resume with approved skills."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to recalculate tailored score";
      setErrorMessage(msg);
    } finally {
      setIsRecalculating(false);
    }
  };

  // 5. Reset Tailoring View to Input
  const handleDiscardTailoring = () => {
    setTailoredResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-blue-100/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[350px] bg-gradient-to-bl from-indigo-100/40 via-purple-100/30 to-transparent blur-[90px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="no-print relative z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MakeMeHire
              </span>
            </Link>
            <span className="ml-2 hidden sm:inline-block rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Tailor Studio
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/ats-score"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <span>ATS Checker</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>

            {isAuthenticated && session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/tailor" })}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`relative z-10 mx-auto px-4 sm:px-6 flex-1 w-full transition-all duration-300 ${
          tailoredResult
            ? "max-w-[1720px] py-4 sm:py-6"
            : "max-w-7xl py-6 sm:py-8"
        }`}
      >
        {/* Unauthenticated View */}
        {!isLoadingAuth && !isAuthenticated ? (
          <div className="mx-auto max-w-xl text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-xs">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Tailor Resume for Job
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Sign in with your Google account to select your saved resumes and tailor your qualifications precisely around any target job description.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/tailor" })}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <span>Sign In with Google</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : isTailoring ? (
          /* Tailoring in progress */
          <div className="mx-auto max-w-2xl py-8">
            <TailorProgressState />
          </div>
        ) : tailoredResult ? (
          /* Interactive Tailored Studio */
          <ResumeTailorView
            tailoredResult={tailoredResult}
            jobDescription={jobDescription}
            onDiscard={handleDiscardTailoring}
            onRecalculateWithSkills={handleRecalculateWithSkills}
            isRecalculating={isRecalculating}
          />
        ) : (
          /* Pre-Tailoring View: Input & Base Resume Preview */
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Tailor for <span className="text-indigo-600">Job</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Paste a job description to see your ATS match score and the keywords you are missing, then tailor your resume around them.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-2xs">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-bold text-rose-900">Notice</p>
                  <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 2-Column Split: Controls & Base Resume Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Input Card */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5">
                {/* Resume Selector */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                    Resume to tailor
                  </label>
                  <ResumeSelector
                    resumes={resumes}
                    selectedResumeId={selectedResume?.id || null}
                    onSelectResume={(resume) => {
                      setSelectedResume(resume);
                      setErrorMessage(null);
                    }}
                    isLoading={isLoadingResumes}
                  />
                </div>

                {/* Job Description Input */}
                <div className="space-y-2">
                  <JobDescriptionInput
                    value={jobDescription}
                    onChange={(val) => {
                      setJobDescription(val);
                      setErrorMessage(null);
                    }}
                    disabled={isTailoring}
                  />
                  <p className="text-[11px] text-slate-500">
                    We score your resume against this job first. Tailoring is the next step, so nothing is rewritten yet.
                  </p>
                </div>

                {/* Action CTA */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleManualTailor}
                    disabled={
                      isTailoring ||
                      !selectedResume ||
                      !jobDescription.trim() ||
                      jobDescription.trim().length < 20
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Tailor for this Job</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Base Resume Preview */}
              <div className="lg:col-span-7 h-[calc(100vh-210px)] min-h-[580px] flex flex-col">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs flex flex-col h-full">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Your Base Resume</span>
                      </span>
                    </div>

                    {selectedResume && (
                      <Link
                        href={`/builder?id=${encodeURIComponent(selectedResume.id)}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Edit in Builder</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 pt-3">
                    {isLoadingBaseResume ? (
                      <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                    ) : baseResumeData ? (
                      <div className="h-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col">
                        <PreviewPanel
                          state={baseResumeData}
                          label="Base Resume"
                          badgeText="Original Baseline"
                          badgeColor="bg-slate-100 text-slate-700"
                          customFileName={`${selectedResume?.name || "Resume"}_Base`}
                          className="h-full"
                        />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="h-10 w-10 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">
                          Select a resume to preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TailorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <TailorPageContent />
    </Suspense>
  );
}
