"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export function GoogleAuthCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="relative group rounded-3xl border-2 border-indigo-200/80 bg-white p-7 sm:p-10 shadow-lg shadow-indigo-100/50 transition-all duration-300">
        {/* Subtle decorative backdrop glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Badge */}
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Sign In Required</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Lock className="h-3 w-3" />
            <span>Encrypted & Safe</span>
          </span>
        </div>

        {/* Header content */}
        <div className="text-left mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Continue with Google to Build Your Resume
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sign in with your Google account to unlock our AI resume extraction engine, ATS-compliant blank canvas templates, and instant multi-format PDF export.
          </p>
        </div>

        {/* Value props checklist */}
        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 mb-8">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>AI-powered extraction from existing PDF resumes</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Standardized ATS section ordering & live preview</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Instant high-resolution Letter & A4 PDF export</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Profile stored securely in database with one-click sign-in</span>
          </div>
        </div>

        {/* Primary Google Login Button */}
        <div>
          <button
            type="button"
            id="continue-with-google-btn"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full relative flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 hover:shadow-md active:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                <span>Redirecting to Google…</span>
              </>
            ) : (
              <>
                {/* Official Google G Logo */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-500 font-medium">
            By continuing, you agree to MakeMeHire terms and privacy standards.
          </p>
        </div>
      </div>
    </div>
  );
}
