import type { BasicData } from "@/lib/types";

export function BasicPreview({ data }: { data: BasicData }) {
  const contactParts = [
    data.location,
    data.phone,
    data.email,
    data.linkedin,
    data.website,
  ].filter((p) => p && p.trim() !== "");

  return (
    <div className="text-center">
      {data.name && (
        <h1 className="text-2xl font-bold tracking-tight text-black">
          {data.name}
        </h1>
      )}
      {data.jobTitle && (
        <p className="text-sm font-medium text-black">{data.jobTitle}</p>
      )}
      {contactParts.length > 0 && (
        <p className="mt-1 text-[11px] text-black">
          {contactParts.join("  |  ")}
        </p>
      )}
    </div>
  );
}
