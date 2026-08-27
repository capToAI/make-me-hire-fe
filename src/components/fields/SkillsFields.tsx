"use client";

import { useState } from "react";
import type { SkillsData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";

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
        <label className={labelClass}>Category label (optional)</label>
        <input
          className={inputClass}
          value={data.categoryLabel ?? ""}
          onChange={(e) => update({ categoryLabel: e.target.value })}
          placeholder="Frontend Development:"
        />
      </div>
      <div>
        <label className={labelClass}>Skills</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {data.items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                aria-label={`Remove ${item}`}
                className="text-zinc-400 hover:text-zinc-700"
              >
                ×
              </button>
            </span>
          ))}
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
            placeholder="Type a skill and press Enter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
