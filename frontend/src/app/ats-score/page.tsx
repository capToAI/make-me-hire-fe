"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { checkAtsScore, fetchUserResumes } from "@/lib/api";
import type { AtsScoreData, ResumeListItem } from "@/lib/types";
import { UserMenu } from "@/components/auth/UserMenu";
import { ResumeSelector } from "@/components/ats-score/ResumeSelector";
import { JobDescriptionInput } from "@/components/ats-score/JobDescriptionInput";
import { AtsLoadingState } from "@/components/ats-score/AtsLoadingState";
import { AtsScoreResult } from "@/components/ats-score/AtsScoreResult";

function AtsScoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreData | null>(null);

  const isAuthenticated = status === "authenticated";
  const isLoadingAuth = status === "loading";

  // 1. Fetch user's saved resumes
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setIsLoadingResumes(true);

    fetchUserResumes()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setResumes(res.data);
          // Check query param for pre-selection
          const preselectedId = searchParams.get("resumeId");
          if (preselectedId) {
            const found = res.data.find((r) => r.id === preselectedId);
            if (found) {
              setSelectedResume(found);
            }
          } else if (res.data.length > 0 && !selectedResume) {
            setSelectedResume(res.data[0]);
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

  // 2. Handle ATS Score Check action
  const onClickCheckScore = async () => {
    setErrorMessage(null);

    if (!selectedResume) {
      setErrorMessage("Please select one of your saved resumes to evaluate.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage(
        "Please enter a complete job description (minimum 20 characters) for an accurate ATS evaluation."
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await checkAtsScore(selectedResume.id, jobDescription.trim());

      if (res.success && res.data) {
        setAtsResult(res.data);
        // Smooth scroll to results
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(
          res.error || "Unable to complete ATS analysis. Please retry."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect to ATS service";
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onResetAnalysis = () => {
    setAtsResult(null);
    setErrorMessage(null);
  };

  const onSelectDifferentResume = () => {
    setAtsResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-blue-100/30 blur-[100px] rounded-full pointer-events-none" />

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
              ATS Checker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>

            {isAuthenticated && session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/ats-score" })}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Unauthenticated View */}
        {!isLoadingAuth && !isAuthenticated ? (
          <div className="mx-auto max-w-xl text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-xs">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              ATS Resume Score Evaluation
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Sign in with your Google account to select your saved resumes and evaluate ATS keyword compatibility against any job description.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/ats-score" })}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <span>Sign In with Google</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : isAnalyzing ? (
          /* Analysis In Progress */
          <div className="mx-auto max-w-2xl py-8">
            <AtsLoadingState />
          </div>
        ) : atsResult ? (
          /* ATS Results Display */
          <AtsScoreResult
            result={atsResult}
            onReset={onResetAnalysis}
            onSelectDifferentResume={onSelectDifferentResume}
          />
        ) : (
          /* ATS Evaluation Input Form */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                <span>AI ATS Screener</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Check Resume ATS Compatibility
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Select one of your saved resumes and paste a target job description to analyze keyword coverage, technical match rank, and actionable improvements.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-2xs">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-bold text-rose-900">Analysis Notice</p>
                  <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 2-Column Layout: Resume Selection (Left) & Job Description (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Saved Resumes */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                    Select Your Resume
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    {resumes.length} saved
                  </span>
                </div>

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

              {/* Right Column: Job Description Input & Action */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={(val) => {
                    setJobDescription(val);
                    setErrorMessage(null);
                  }}
                  disabled={isAnalyzing}
                />

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClickCheckScore}
                    disabled={
                      isAnalyzing ||
                      !selectedResume ||
                      !jobDescription.trim() ||
                      jobDescription.trim().length < 20
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>
                          Check ATS Score
                          {selectedResume ? ` for "${selectedResume.name}"` : ""}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print relative z-10 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} MakeMeHire ATS Resume Evaluator. Zero data mutation guarantee.</p>
        </div>
      </footer>
    </div>
  );
}

export default function AtsScorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <AtsScoreContent />
    </Suspense>
  );
}
