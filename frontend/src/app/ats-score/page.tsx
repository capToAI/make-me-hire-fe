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
  Gauge,
  GaugeCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { checkAtsScore, fetchUserResumes, tailorResume } from "@/lib/api";
import type {
  AtsScoreData,
  ResumeListItem,
  TailoredResumeResponse,
} from "@/lib/types";
import { UserMenu } from "@/components/auth/UserMenu";
import { ResumeSelector } from "@/components/ats-score/ResumeSelector";
import { JobDescriptionInput } from "@/components/ats-score/JobDescriptionInput";
import { AtsScoreResult } from "@/components/ats-score/AtsScoreResult";
import { TailorProgressState } from "@/components/ats-score/tailor/TailorProgressState";
import { ResumeTailorView } from "@/components/ats-score/tailor/ResumeTailorView";

function AtsScoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreData | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [tailoredResult, setTailoredResult] =
    useState<TailoredResumeResponse | null>(null);

  // Track last evaluated inputs to toggle "Checked" state
  const [lastAnalyzedResumeId, setLastAnalyzedResumeId] = useState<
    string | null
  >(null);
  const [lastAnalyzedJobDesc, setLastAnalyzedJobDesc] = useState<string | null>(
    null,
  );

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
    setTailoredResult(null);

    if (!selectedResume) {
      setErrorMessage("Please select one of your saved resumes to evaluate.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage(
        "Please enter a complete job description (minimum 20 characters) for an accurate ATS evaluation.",
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await checkAtsScore(selectedResume.id, jobDescription.trim());

      if (res.success && res.data) {
        setAtsResult(res.data);
        setLastAnalyzedResumeId(selectedResume.id);
        setLastAnalyzedJobDesc(jobDescription.trim());
      } else {
        setErrorMessage(
          res.error || "Unable to complete ATS analysis. Please retry.",
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

  // 3. Handle Tailor Resume Action - route to dedicated /tailor screen
  const onStartTailoring = () => {
    if (!selectedResume) {
      setErrorMessage("Please select a resume to tailor.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage("A valid job description is required for tailoring.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("tailor_target_resume_id", selectedResume.id);
      sessionStorage.setItem("tailor_target_job_desc", jobDescription.trim());
      sessionStorage.setItem("tailor_auto_start", "true");
    }

    router.push(
      `/tailor?resumeId=${encodeURIComponent(selectedResume.id)}&autoTailor=true`,
    );
  };

  // 4. Handle Skill Recalculation
  const onRecalculateWithSkills = async (
    confirmedSkills: string[],
    rejectedSkills: string[],
  ) => {
    if (!selectedResume || !jobDescription.trim()) return;

    setIsRecalculating(true);
    setErrorMessage(null);

    try {
      const res = await tailorResume(
        selectedResume.id,
        jobDescription.trim(),
        confirmedSkills,
        rejectedSkills,
      );

      if (res.success && res.data) {
        setTailoredResult(res.data);
      } else {
        setErrorMessage(
          res.error || "Unable to update tailored resume with approved skills.",
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to recalculate tailored score";
      setErrorMessage(msg);
    } finally {
      setIsRecalculating(false);
    }
  };

  // 5. Discard Tailoring & Return to ATS Result
  const onDiscardTailoring = () => {
    setTailoredResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Determine if current inputs match the checked analysis
  const isAnalyzedAndUnchanged =
    Boolean(atsResult) &&
    lastAnalyzedResumeId === selectedResume?.id &&
    lastAnalyzedJobDesc === jobDescription.trim();

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
              ATS Checker
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/tailor"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Tailor Resume</span>
            </Link>

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
      <main
        className={`relative z-10 mx-auto px-4 sm:px-6 flex-1 w-full transition-all duration-300 ${
          tailoredResult
            ? "max-w-[1720px] py-3 sm:py-4"
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
              Check your ATS Score
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Sign in with your Google account to pick a resume, paste a job
              description, and see how it scores and which keywords it is
              missing.
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
        ) : isTailoring ? (
          /* Resume Tailoring In Progress */
          <div className="mx-auto max-w-2xl py-8">
            <TailorProgressState />
          </div>
        ) : tailoredResult ? (
          /* Tailored Resume Comparison Studio */
          <ResumeTailorView
            tailoredResult={tailoredResult}
            jobDescription={jobDescription}
            onDiscard={onDiscardTailoring}
            onRecalculateWithSkills={onRecalculateWithSkills}
            isRecalculating={isRecalculating}
          />
        ) : (
          /* 2-Column Split: Inputs (Left) & Results/Empty State (Right) */
          <div className="space-y-6">
            {/* Page Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-indigo-600" />
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Check your <span className="text-indigo-600">ATS Score</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Pick a resume, paste a job description, and see how it scores
                and which keywords it is missing. Your resume is not changed.
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

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Input Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5">
                {/* Resume Selector */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                    Resume to check
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
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={(val) => {
                    setJobDescription(val);
                    setErrorMessage(null);
                  }}
                  disabled={isAnalyzing}
                />

                {/* Action Button */}
                <div className="pt-1">
                  {isAnalyzing ? (
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 py-3 text-xs sm:text-sm font-semibold text-indigo-700 cursor-wait shadow-2xs"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Analyzing Resume...</span>
                    </button>
                  ) : isAnalyzedAndUnchanged ? (
                    <div className="w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 py-3 text-center text-xs sm:text-sm font-medium text-slate-400 select-none">
                      Checked. Edit the job description to check again
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onClickCheckScore}
                      disabled={
                        !selectedResume ||
                        !jobDescription.trim() ||
                        jobDescription.trim().length < 20
                      }
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/80 hover:border-indigo-300 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Gauge className="h-4 w-4 text-indigo-600" />
                      <span>Check ATS Score</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Score Results or Empty State */}
              <div>
                {isAnalyzing ? (
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xs flex flex-col items-center justify-center text-center min-h-[460px]">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <RefreshCw className="h-7 w-7 animate-spin text-indigo-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      Analyzing ATS Compatibility...
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                      Evaluating your resume against keywords, skills, and
                      requirements in the job description.
                    </p>
                  </div>
                ) : atsResult ? (
                  <AtsScoreResult
                    result={atsResult}
                    onTailorResume={onStartTailoring}
                    isTailoring={isTailoring}
                  />
                ) : (
                  /* Initial Empty State matching Screenshot 2 */
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xs flex flex-col items-center justify-center text-center min-h-[460px]">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400">
                      <GaugeCircle className="h-9 w-9 text-slate-400 stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      Your score will appear here
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                      Paste a job description on the left and hit Check ATS
                      Score to see your match and missing keywords.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
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
