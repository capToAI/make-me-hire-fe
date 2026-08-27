"use client";

import type { ChangeEvent } from "react";

import {
  Award,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  FolderPlus,
  Globe,
  GraduationCap,
  Trash2,
  User,
  Wrench,
} from "lucide-react";

import { BasicFields } from "@/components/fields/BasicFields";
import { CertificationsFields } from "@/components/fields/CertificationsFields";
import { CustomFields } from "@/components/fields/CustomFields";
import { EducationFields } from "@/components/fields/EducationFields";
import { ExperienceFields } from "@/components/fields/ExperienceFields";
import { LanguagesFields } from "@/components/fields/LanguagesFields";
import { SkillsFields } from "@/components/fields/SkillsFields";
import { SummaryFields } from "@/components/fields/SummaryFields";
import type { ResumeAction } from "@/lib/resumeReducer";
import type {
  BasicData,
  CertificationsData,
  CustomData,
  EducationData,
  ExperienceData,
  LanguagesData,
  Section,
  SkillsData,
  SummaryData,
} from "@/lib/types";

interface SectionCardProps {
  section: Section;
  dispatch: (action: ResumeAction) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SectionCard({
  section,
  dispatch,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: SectionCardProps) {
  // Helpers
  const getSectionIcon = (type: string) => {
    switch (type) {
      case "basic":
        return <User className="h-4 w-4 text-indigo-600 shrink-0" />;
      case "summary":
        return <FileText className="h-4 w-4 text-emerald-600 shrink-0" />;
      case "experience":
        return <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />;
      case "education":
        return <GraduationCap className="h-4 w-4 text-amber-600 shrink-0" />;
      case "skills":
        return <Wrench className="h-4 w-4 text-violet-600 shrink-0" />;
      case "certifications":
        return <Award className="h-4 w-4 text-teal-600 shrink-0" />;
      case "languages":
        return <Globe className="h-4 w-4 text-cyan-600 shrink-0" />;
      default:
        return <FolderPlus className="h-4 w-4 text-rose-600 shrink-0" />;
    }
  };

  // Event Handlers
  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_SECTION_TITLE",
      sectionId: section.id,
      title: e.target.value,
    });
  };

  const onClickToggleVisibility = () => {
    dispatch({
      type: "TOGGLE_SECTION_VISIBILITY",
      sectionId: section.id,
    });
  };

  const onClickRemoveSection = () => {
    dispatch({ type: "REMOVE_SECTION", sectionId: section.id });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200">
      {/* Section Sub-Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80">
            {getSectionIcon(section.type)}
          </div>

          {section.type === "custom" ? (
            <input
              className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-base font-bold text-slate-900 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={section.title}
              onChange={onChangeTitle}
              placeholder="Custom Section Title"
            />
          ) : (
            <h2 className="truncate text-base font-bold text-slate-900">
              {section.title}
            </h2>
          )}
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Reorder Up/Down */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-2xs disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all cursor-pointer"
              title="Move tab position left/up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-2xs disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all cursor-pointer"
              title="Move tab position right/down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={onClickToggleVisibility}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              section.visible
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-amber-100/70 text-amber-800 hover:bg-amber-200/70"
            }`}
            title={section.visible ? "Hide section in preview" : "Show section in preview"}
          >
            {section.visible ? (
              <>
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 text-amber-700" />
                <span>Hidden</span>
              </>
            )}
          </button>

          {/* Delete custom section button */}
          {section.type === "custom" && (
            <button
              type="button"
              onClick={onClickRemoveSection}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete custom section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5">
        {section.type === "basic" && (
          <BasicFields
            sectionId={section.id}
            data={section.data as BasicData}
            dispatch={dispatch}
          />
        )}
        {section.type === "summary" && (
          <SummaryFields
            sectionId={section.id}
            data={section.data as SummaryData}
            dispatch={dispatch}
          />
        )}
        {section.type === "skills" && (
          <SkillsFields
            sectionId={section.id}
            data={section.data as SkillsData}
            dispatch={dispatch}
          />
        )}
        {section.type === "experience" && (
          <ExperienceFields
            sectionId={section.id}
            data={section.data as ExperienceData}
            dispatch={dispatch}
          />
        )}
        {section.type === "education" && (
          <EducationFields
            sectionId={section.id}
            data={section.data as EducationData}
            dispatch={dispatch}
          />
        )}
        {section.type === "certifications" && (
          <CertificationsFields
            sectionId={section.id}
            data={section.data as CertificationsData}
            dispatch={dispatch}
          />
        )}
        {section.type === "languages" && (
          <LanguagesFields
            sectionId={section.id}
            data={section.data as LanguagesData}
            dispatch={dispatch}
          />
        )}
        {section.type === "custom" && (
          <CustomFields
            sectionId={section.id}
            data={section.data as CustomData}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}



