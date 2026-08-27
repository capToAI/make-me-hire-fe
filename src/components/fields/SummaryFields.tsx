import type { SummaryData } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { labelClass } from "@/lib/ui";

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
      <label className={labelClass}>Summary</label>
      <textarea
        className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
        rows={4}
        value={data.text}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_SECTION_DATA",
            sectionId,
            data: { text: e.target.value },
          })
        }
        placeholder="A short paragraph summarizing your experience and strengths…"
      />
    </div>
  );
}
