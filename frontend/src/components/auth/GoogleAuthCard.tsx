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
    <div className="w-full max-w-md mx-auto">
      <div className="relative group rounded-3xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-xl shadow-indigo-100/50 transition-all duration-300">
        {/* Subtle decorative backdrop glow */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>Instant Access</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Lock className="h-3 w-3" />
            <span>Encrypted & Safe</span>
          </span>
        </div>

        {/* Card Heading */}
        <div className="text-left mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Start Building
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
            One click to create new resumes or import existing PDFs with AI.
          </p>
        </div>

        {/* Primary Google Login Button - High Priority CTA */}
        <div className="mb-5">
          <button
            type="button"
            id="continue-with-google-btn"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full relative flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 px-5 py-3.5 text-sm sm:text-base font-bold text-slate-800 shadow-sm hover:shadow-md hover:border-slate-400 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Connecting to Google…</span>
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
        </div>

        {/* Compact Value Props */}
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4 mb-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>AI resume extraction & auto-filling</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>ATS-friendly layouts & live preview</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Instant high-res Letter & A4 PDF export</span>
          </div>
        </div>

        {/* Micro Footer */}
        <p className="text-center text-[11px] text-slate-400">
          Free to use • No credit card required • Secure OAuth 2.0
        </p>
      </div>
    </div>
  );
}
