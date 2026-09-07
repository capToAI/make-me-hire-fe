"use client";

import { useMemo } from "react";
import { Clipboard, FileCode2, Trash2 } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SAMPLE_JOB_DESCRIPTION = `Role: Senior Full Stack Engineer (React & Node.js / NestJS)

Responsibilities:
- Architect and develop performant, scalable web applications using TypeScript, Next.js, and React.
- Design resilient REST APIs and backend microservices with NestJS, Node.js, and PostgreSQL.
- Build reliable database schemas, indexes, and write optimized SQL queries using TypeORM.
- Implement CI/CD deployment pipelines, automated tests with Jest, and containerize services with Docker.
- Collaborate with cross-functional product teams using Agile methodologies and deliver clean, well-tested code.

Requirements & Qualifications:
- 4+ years of professional full-stack software development experience.
- Strong proficiency in TypeScript, React, Next.js, HTML5, and Tailwind CSS.
- Solid backend experience with Node.js, NestJS, Express, and PostgreSQL/MongoDB.
- Working knowledge of cloud infrastructure (AWS, Docker, Kubernetes) and CI/CD workflows.
- Experience writing comprehensive unit and integration tests (Jest, Cypress).
- Excellent communication skills, system design fundamentals, and team leadership.`;

export function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
}: JobDescriptionInputProps) {
  const stats = useMemo(() => {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = value.length;
    return { words, chars };
  }, [value]);

  const onClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {
      // Clipboard permissions may not be granted
    }
  };

  const onClickLoadSample = () => {
    onChange(SAMPLE_JOB_DESCRIPTION);
  };

  const onClickClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="job-description-textarea"
          className="text-xs sm:text-sm font-bold text-slate-800"
        >
          Target Job Description
        </label>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onClickLoadSample}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Load a sample job description"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={onClickPaste}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Paste from clipboard"
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span>Paste</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={onClickClear}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Clear text"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="job-description-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste the full target job posting or requirements here (responsibilities, required skills, technical stack, qualifications)..."
          rows={10}
          className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
        <span>Minimum 20 characters recommended for accurate parsing.</span>
        <span>
          {stats.words} words • {stats.chars} characters
        </span>
      </div>
    </div>
  );
}
