"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import type {
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CertificationsData,
  LanguagesData,
  CustomData,
} from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { BasicFields } from "@/components/fields/BasicFields";
import { SummaryFields } from "@/components/fields/SummaryFields";
import { SkillsFields } from "@/components/fields/SkillsFields";
import { ExperienceFields } from "@/components/fields/ExperienceFields";
import { EducationFields } from "@/components/fields/EducationFields";
import { CertificationsFields } from "@/components/fields/CertificationsFields";
import { LanguagesFields } from "@/components/fields/LanguagesFields";
import { CustomFields } from "@/components/fields/CustomFields";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Globe,
  FolderPlus,
} from "lucide-react";

type DragHandleProps = {
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
};

type CardDropProps = {
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

export function SectionCard({
  section,
  dispatch,
  dragHandleProps,
  cardDropProps,
  isDragOver,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  section: Section;
  dispatch: (action: ResumeAction) => void;
  dragHandleProps: DragHandleProps;
  cardDropProps: CardDropProps;
  isDragOver: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  function getSectionIcon(type: string) {
    switch (type) {
      case "basic":
        return <User className="h-4 w-4 text-indigo-500" />;
      case "summary":
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case "experience":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "education":
        return <GraduationCap className="h-4 w-4 text-amber-500" />;
      case "skills":
        return <Wrench className="h-4 w-4 text-violet-500" />;
      case "certifications":
        return <Award className="h-4 w-4 text-teal-500" />;
      case "languages":
        return <Globe className="h-4 w-4 text-cyan-500" />;
      default:
        return <FolderPlus className="h-4 w-4 text-rose-500" />;
    }
  }

  return (
    <div
      {...cardDropProps}
      className={`group rounded-xl border bg-white shadow-xs transition-all duration-200 ${
        isDragOver
          ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20 scale-[1.01]"
          : section.visible
          ? "border-slate-200 hover:border-slate-300"
          : "border-slate-200/60 bg-slate-50/60 opacity-75"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab touch-none p-1 text-slate-300 hover:text-slate-600 active:cursor-grabbing transition-colors"
            title="Drag to reorder section"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Quick Move Up/Down Buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent"
              title="Move section up"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent"
              title="Move section down"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Section Icon & Title */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              {getSectionIcon(section.type)}
            </div>

            {section.type === "custom" ? (
              <input
                className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-bold text-slate-800 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none"
                value={section.title}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SECTION_TITLE",
                    sectionId: section.id,
                    title: e.target.value,
                  })
                }
              />
            ) : (
              <span className="truncate text-sm font-bold text-slate-800">
                {section.title}
              </span>
            )}
          </div>
        </div>

        {/* Section Actions */}
        <div className="flex items-center gap-1">
          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "TOGGLE_SECTION_VISIBILITY",
                sectionId: section.id,
              })
            }
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
              section.visible
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
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
                <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                <span>Hidden</span>
              </>
            )}
          </button>

          {/* Delete custom section button */}
          {section.type === "custom" && (
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "REMOVE_SECTION", sectionId: section.id })
              }
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Delete custom section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Accordion expand/collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      {!isCollapsed && (
        <div className="border-t border-slate-100 p-4">
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
      )}
    </div>
  );
}

