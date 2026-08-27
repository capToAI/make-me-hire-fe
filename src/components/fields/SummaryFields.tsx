import type { SummaryData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { labelClass } from "@/lib/ui";
import { FileText } from "lucide-react";

export function SummaryFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: SummaryData;
  dispatch: (action: ResumeAction) => void;
}) {
  return (
    <div>
      <label className={labelClass}>
        <FileText className="h-3.5 w-3.5 text-slate-400" />
        Professional Summary
      </label>
      <textarea
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        rows={4}
        value={data.text}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_SECTION_DATA",
            sectionId,
            data: { text: e.target.value },
          })
        }
        placeholder="A short, impactful paragraph highlighting your core background, strengths, and career objectives…"
      />
    </div>
  );
}

