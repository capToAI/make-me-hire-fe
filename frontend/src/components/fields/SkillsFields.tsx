"use client";

import { useState } from "react";
import type { SkillsData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";
import { Tag, Sparkles, Plus, X } from "lucide-react";

export function SkillsFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: SkillsData;
  dispatch: (action: ResumeAction) => void;
}) {
  const [draft, setDraft] = useState("");

  const update = (patch: Partial<SkillsData>) =>
    dispatch({
      type: "UPDATE_SECTION_DATA",
      sectionId,
      data: { ...data, ...patch },
    });

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    update({ items: [...data.items, value] });
    setDraft("");
  }

  function removeSkill(index: number) {
    update({ items: data.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          Category label (optional)
        </label>
        <input
          className={inputClass}
          value={data.categoryLabel ?? ""}
          onChange={(e) => update({ categoryLabel: e.target.value })}
          placeholder="Frontend Development:"
        />
      </div>

      <div>
        <label className={labelClass}>
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Skills list
        </label>

        <div className="mb-2.5 flex flex-wrap gap-1.5 min-h-[32px] rounded-lg border border-slate-200 bg-slate-50/50 p-2">
          {data.items.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No skills added yet</span>
          ) : (
            data.items.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-2xs transition-all hover:bg-indigo-100"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  aria-label={`Remove ${item}`}
                  className="rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            className={inputClass}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type skill name and press Enter…"
          />
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

