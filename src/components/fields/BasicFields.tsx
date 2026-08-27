"use client";

import { useState } from "react";
import type { BasicData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";

export function BasicFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: BasicData;
  dispatch: (action: ResumeAction) => void;
}) {
  const [nameTouched, setNameTouched] = useState(false);
  const showNameHint = nameTouched && data.name.trim() === "";

  const update = (patch: Partial<BasicData>) =>
    dispatch({
      type: "UPDATE_SECTION_DATA",
      sectionId,
      data: { ...data, ...patch },
    });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className={labelClass}>Full name</label>
        <input
          className={inputClass}
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => setNameTouched(true)}
          placeholder="Jane Doe"
        />
        {showNameHint && (
          <p className="mt-1 text-xs text-amber-600">
            Add your name — it&apos;s what shows at the top of the resume.
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>Job title</label>
        <input
          className={inputClass}
          value={data.jobTitle}
          onChange={(e) => update({ jobTitle: e.target.value })}
          placeholder="Senior Software Engineer"
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          className={inputClass}
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="jane@example.com"
        />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input
          className={inputClass}
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+1 555 123 4567"
        />
      </div>
      <div>
        <label className={labelClass}>Location</label>
        <input
          className={inputClass}
          value={data.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </div>
      <div>
        <label className={labelClass}>LinkedIn (optional)</label>
        <input
          className={inputClass}
          value={data.linkedin ?? ""}
          onChange={(e) => update({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/janedoe"
        />
      </div>
      <div>
        <label className={labelClass}>Website (optional)</label>
        <input
          className={inputClass}
          value={data.website ?? ""}
          onChange={(e) => update({ website: e.target.value })}
          placeholder="janedoe.dev"
        />
      </div>
    </div>
  );
}
