import { renderFormattedText } from "@/lib/renderFormattedText";

export function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-1.5 mt-4 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
      {renderFormattedText(title)}
    </h2>
  );
}
