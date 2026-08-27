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
      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          Professional Summary
        </label>
        <span className="text-[10px] font-medium text-slate-400">
          Tip: Use <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">**text**</code> for bold
        </span>
      </div>
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

