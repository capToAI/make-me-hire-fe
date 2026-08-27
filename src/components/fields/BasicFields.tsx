"use client";

import { useState } from "react";
import type { BasicData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";
import { User, Briefcase, Mail, Phone, MapPin, Link2, Globe } from "lucide-react";

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
        <label className={labelClass}>
          <User className="h-3.5 w-3.5 text-slate-400" />
          Full name
        </label>
        <input
          className={inputClass}
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => setNameTouched(true)}
          placeholder="Jane Doe"
        />
        {showNameHint && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Add your name — it&apos;s what shows at the top of the resume.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          Job title
        </label>
        <input
          className={inputClass}
          value={data.jobTitle}
          onChange={(e) => update({ jobTitle: e.target.value })}
          placeholder="Senior Software Engineer"
        />
      </div>

      <div>
        <label className={labelClass}>
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          Email address
        </label>
        <input
          className={inputClass}
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label className={labelClass}>
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          Phone number
        </label>
        <input
          className={inputClass}
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div>
        <label className={labelClass}>
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          Location
        </label>
        <input
          className={inputClass}
          value={data.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </div>

      <div>
        <label className={labelClass}>
          <Link2 className="h-3.5 w-3.5 text-slate-400" />
          LinkedIn profile
        </label>
        <input
          className={inputClass}
          value={data.linkedin ?? ""}
          onChange={(e) => update({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/janedoe"
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          Website / Portfolio
        </label>
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


