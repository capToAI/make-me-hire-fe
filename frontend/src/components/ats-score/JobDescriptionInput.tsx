"use client";

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
  const chars = value.length;

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
          Job Description
        </label>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onClickLoadSample}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Load a sample job description"
          >
            <FileCode2 className="h-3 w-3" />
            <span>Sample</span>
          </button>

          <button
            type="button"
            onClick={onClickPaste}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Paste from clipboard"
          >
            <Clipboard className="h-3 w-3" />
            <span>Paste</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={onClickClear}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Clear text"
            >
              <Trash2 className="h-3 w-3" />
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
          maxLength={20000}
          placeholder="Paste the full job description from LinkedIn, Indeed, or any job portal..."
          rows={12}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
        <span>Paste the complete posting. Exact keywords matter for ATS matching.</span>
        <span className="font-mono">
          {chars.toLocaleString()} / 20,000
        </span>
      </div>
    </div>
  );
}

