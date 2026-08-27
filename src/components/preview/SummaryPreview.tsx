import type { SummaryData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

export function SummaryPreview({
  title,
  data,
}: {
  title: string;
  data: SummaryData;
}) {
  return (
    <div>
      <SectionHeading title={title} />
      <p className="whitespace-pre-line text-[11.5px] leading-snug text-black">
        {data.text}
      </p>
    </div>
  );
}
