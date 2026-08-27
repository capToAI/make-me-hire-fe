import type { DragEvent } from "react";
import type {
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CustomData,
} from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { BasicFields } from "@/components/fields/BasicFields";
import { SummaryFields } from "@/components/fields/SummaryFields";
import { SkillsFields } from "@/components/fields/SkillsFields";
import { ExperienceFields } from "@/components/fields/ExperienceFields";
import { EducationFields } from "@/components/fields/EducationFields";
import { CustomFields } from "@/components/fields/CustomFields";

type DragHandleProps = {
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
};

export function SectionCard({
  section,
  dispatch,
  dragHandleProps,
  isDragOver,
}: {
  section: Section;
  dispatch: (action: ResumeAction) => void;
  dragHandleProps: DragHandleProps;
  isDragOver: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition-colors ${
        isDragOver ? "border-zinc-500 bg-zinc-50" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            {...dragHandleProps}
            className="cursor-grab select-none text-lg leading-none text-zinc-400"
            title="Drag to reorder section"
          >
            ⠿
          </span>
          {section.type === "custom" ? (
            <input
              className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-zinc-800 hover:border-zinc-200 focus:border-zinc-400 focus:outline-none"
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
            <span className="truncate text-sm font-semibold text-zinc-800">
              {section.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "TOGGLE_SECTION_VISIBILITY",
                sectionId: section.id,
              })
            }
            className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
            title={section.visible ? "Hide from preview" : "Show in preview"}
          >
            {section.visible ? "Visible" : "Hidden"}
          </button>
          {section.type === "custom" && (
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "REMOVE_SECTION", sectionId: section.id })
              }
              className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="p-3">
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
