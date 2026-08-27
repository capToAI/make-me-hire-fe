export function formatDateRange(
  start?: string,
  end?: string,
  current?: boolean
): string {
  const startText = start?.trim() ?? "";
  const endText = current ? "Present" : (end?.trim() ?? "");
  if (!startText && !endText) return "";
  if (!startText) return endText;
  if (!endText) return startText;
  return `${startText} – ${endText}`;
}
