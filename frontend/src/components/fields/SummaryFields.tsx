"use client";

import { useRef } from "react";
import type { SummaryData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import {
  Bold,
  Trash2,
  Code,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function SummaryFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: SummaryData;
  dispatch: (action: ResumeAction) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const text = data.text || "";

  // Metrics calculations
  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;
  const estimatedReadSecs = Math.max(1, Math.round(wordsCount / 3.2));

  // Summary health indicator
  const getHealth = () => {
    if (wordsCount === 0) {
      return {
        label: "Empty",
        color: "text-slate-500 bg-slate-100 border-slate-200",
        tip: "Write a 3-4 sentence overview highlighting your key background and strengths.",
        icon: AlertCircle,
      };
    }
    if (wordsCount < 25) {
      return {
        label: "Short",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        tip: "Consider adding 1-2 more details or key skills for maximum impact (aim for 35–70 words).",
        icon: AlertCircle,
      };
    }
    if (wordsCount <= 80) {
      return {
        label: "Optimal",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        tip: "Great length! Concise, clear, and easy for recruiters to scan.",
        icon: CheckCircle2,
      };
    }
    return {
      label: "A bit long",
      color: "text-rose-700 bg-rose-50 border-rose-200",
      tip: "Consider trimming down verbose sentences to keep your resume compact.",
      icon: AlertCircle,
    };
  };

  const health = getHealth();

  // Text update helper
  const updateText = (newText: string) => {
    dispatch({
      type: "UPDATE_SECTION_DATA",
      sectionId,
      data: { text: newText },
    });
  };

  // Toggle bold formatting (**text**)
  const handleToggleBold = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = text.substring(start, end);

    let newText = text;
    let newCursorPos = start;

    if (selectedText.length > 0) {
      // Check if already bolded
      if (selectedText.startsWith("**") && selectedText.endsWith("**")) {
        const unbolded = selectedText.slice(2, -2);
        newText = text.substring(0, start) + unbolded + text.substring(end);
        newCursorPos = start + unbolded.length;
      } else {
        const bolded = `**${selectedText}**`;
        newText = text.substring(0, start) + bolded + text.substring(end);
        newCursorPos = end + 4;
      }
    } else {
      // Insert placeholder bold syntax
      const placeholder = "**key skill**";
      newText = text.substring(0, start) + placeholder + text.substring(end);
      newCursorPos = start + placeholder.length;
    }

    updateText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          selectedText ? start : start + 2,
          selectedText ? newCursorPos : start + 11
        );
      }
    }, 5);
  };

  const HealthIcon = health.icon;

  return (
    <div className="space-y-3">
      {/* Text Area Container */}
      <div className="space-y-0">
        {/* Toolbar Header above Textarea */}
        <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
          {/* Left: Bold Button */}
          <button
            type="button"
            onClick={handleToggleBold}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            title="Wrap selected text in **bold** syntax"
          >
            <Bold className="h-3.5 w-3.5 text-slate-800" />
            <span>Bold</span>
          </button>

          {/* Right: Clear Button */}
          {text && (
            <button
              type="button"
              onClick={() => updateText("")}
              className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          className="w-full rounded-b-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs min-h-[120px]"
          rows={5}
          value={text}
          onChange={(e) => updateText(e.target.value)}
          placeholder="Write a compelling 3-4 sentence professional summary highlighting your background, core strengths, key achievements, and career goals…"
        />
      </div>

      {/* Metrics & Health Footer */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Health Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${health.color}`}
            >
              <HealthIcon className="h-3 w-3" />
              <span>{health.label}</span>
            </span>

            <span className="text-slate-500 text-[11px]">
              {wordsCount} words · {charsCount} chars · ~{estimatedReadSecs}s read
            </span>
          </div>

          {/* Quick Syntax Hint */}
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Code className="h-3 w-3 text-slate-400" />
            <span>
              Tip: Select text & click <strong className="text-slate-600 font-bold">Bold</strong> or type{" "}
              <code className="rounded bg-slate-200/70 px-1 py-0.5 text-slate-700">**bold**</code>
            </span>
          </div>
        </div>

        {/* Health Tip Description */}
        <p className="text-[11px] text-slate-500 leading-normal pl-0.5">{health.tip}</p>
      </div>
    </div>
  );
}



