"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectsData, ProjectEntry } from "@/lib/types";
import type { ResumeAction } from "@/lib/resumeReducer";
import { inputClass, labelClass } from "@/lib/ui";
import { useDragReorder } from "@/hooks/useDragReorder";
import { refineProjectBulletsWithAi } from "@/lib/api";
import { ProjectRefineModal } from "./ProjectRefineModal";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  FolderGit2,
} from "lucide-react";

interface BulletItemProps {
  bullet: string;
  index: number;
  onUpdate: (val: string) => void;
  onRemove: () => void;
  handleProps: Record<string, unknown>;
  cardProps: Record<string, unknown>;
  isOver: boolean;
}

function BulletItem({
  bullet,
  index,
  onUpdate,
  onRemove,
  handleProps,
  cardProps,
  isOver,
}: BulletItemProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        42,
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [bullet]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = bullet.substring(start, end);

      let newText: string;
      let newCursorPos: number;

      if (selected.length > 0) {
        if (selected.startsWith("**") && selected.endsWith("**")) {
          const unbolded = selected.slice(2, -2);
          newText = bullet.substring(0, start) + unbolded + bullet.substring(end);
          newCursorPos = start + unbolded.length;
        } else {
          const bolded = `**${selected}**`;
          newText = bullet.substring(0, start) + bolded + bullet.substring(end);
          newCursorPos = end + 4;
        }
      } else {
        const placeholder = "**key metric**";
        newText = bullet.substring(0, start) + placeholder + bullet.substring(end);
        newCursorPos = start + placeholder.length;
      }

      onUpdate(newText);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            selected ? start : start + 2,
            selected ? newCursorPos : start + 12
          );
        }
      }, 5);
    }
  };

  return (
    <div
      {...cardProps}
      className={`group flex items-start gap-2.5 rounded-xl border p-2 sm:p-2.5 transition-all ${
        isOver
          ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
      }`}
    >
      <button
        type="button"
        {...handleProps}
        className="mt-2 shrink-0 cursor-grab touch-none rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing transition-colors"
        title="Drag to reorder bullet point"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          className="w-full rounded-lg border-0 bg-transparent px-2 py-1 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 min-h-[42px] resize-none overflow-hidden"
          rows={1}
          value={bullet}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What it does, who uses it, and the impact..."
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove bullet"
        className="mt-2 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
        title="Delete bullet point"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProjectsFields({
  sectionId,
  data,
  dispatch,
}: {
  sectionId: string;
  data: ProjectsData;
  dispatch: (action: ResumeAction) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [techDrafts, setTechDrafts] = useState<Record<string, string>>({});

  // AI Refine State
  const [refiningEntryId, setRefiningEntryId] = useState<string | null>(null);
  const [refineModalData, setRefineModalData] = useState<{
    entryId: string;
    projectName: string;
    oldBullets: string[];
    newBullets: string[];
  } | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  const { getHandleProps, getCardProps, overIndex } = useDragReorder(
    (fromIndex, toIndex) =>
      dispatch({ type: "REORDER_ENTRIES", sectionId, fromIndex, toIndex })
  );

  function updateEntry(entryId: string, patch: Partial<ProjectEntry>) {
    const entries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry
    );
    dispatch({ type: "UPDATE_SECTION_DATA", sectionId, data: { entries } });
  }

  function addTechnology(entryId: string) {
    const raw = (techDrafts[entryId] || "").trim();
    if (!raw) return;

    // Support comma-separated items
    const splitItems = raw
      .split(/[,+]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (splitItems.length === 0) return;

    const entry = data.entries.find((e) => e.id === entryId);
    const existing = entry?.technologies || [];
    const newItems = splitItems.filter((item) => !existing.includes(item));

    updateEntry(entryId, { technologies: [...existing, ...newItems] });
    setTechDrafts((prev) => ({ ...prev, [entryId]: "" }));
  }

  function removeTechnology(entryId: string, techIndex: number) {
    const entry = data.entries.find((e) => e.id === entryId);
    if (!entry) return;
    const technologies = entry.technologies.filter((_, i) => i !== techIndex);
    updateEntry(entryId, { technologies });
  }

  async function handleRefineWithAi(entry: ProjectEntry) {
    const validBullets = entry.bullets.filter((b) => b.trim().length > 0);
    if (validBullets.length === 0) {
      setRefineError("Please enter at least one bullet point first before refining.");
      return;
    }

    setRefiningEntryId(entry.id);
    setRefineError(null);

    try {
      const res = await refineProjectBulletsWithAi({
        projectName: entry.name,
        technologies: entry.technologies,
        bullets: validBullets,
      });

      if (res.success && res.data) {
        setRefineModalData({
          entryId: entry.id,
          projectName: entry.name || "Project",
          oldBullets: res.data.originalBullets,
          newBullets: res.data.refinedBullets,
        });
      } else {
        setRefineError(res.error || "Failed to refine bullets. Please try again.");
      }
    } catch {
      setRefineError("Network error while connecting to AI refinement service.");
    } finally {
      setRefiningEntryId(null);
    }
  }

  function applyRefinedBullets() {
    if (!refineModalData) return;
    updateEntry(refineModalData.entryId, {
      bullets: refineModalData.newBullets,
    });
    setRefineModalData(null);
  }

  return (
    <div className="space-y-4">
      {refineError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center justify-between">
          <span>{refineError}</span>
          <button
            type="button"
            onClick={() => setRefineError(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {data.entries.map((entry, index) => {
        const isCollapsed = Boolean(collapsed[entry.id]);
        const label = entry.name.trim() || "New Project";
        const isRefining = refiningEntryId === entry.id;

        return (
          <div
            key={entry.id}
            {...getCardProps(index)}
            className={`rounded-2xl border transition-all ${
              overIndex === index
                ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
          >
            {/* Card Accordion Header */}
            <div className="flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  {...getHandleProps(index)}
                  className="cursor-grab touch-none rounded-md p-1 text-slate-300 hover:bg-slate-200/60 hover:text-slate-600 active:cursor-grabbing transition-colors shrink-0"
                  title="Drag to reorder project"
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [entry.id]: !c[entry.id] }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 transition-transform" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 transition-transform" />
                  )}
                  <span className="truncate uppercase tracking-tight">{label}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "REMOVE_ENTRY",
                    sectionId,
                    entryId: entry.id,
                  })
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Expanded Form Fields */}
            {!isCollapsed && (
              <div className="space-y-4 border-t border-slate-200 bg-white p-4 sm:p-5 rounded-b-2xl">
                {/* 2-Column: Project Name & Link */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input
                      className={inputClass}
                      value={entry.name}
                      onChange={(e) =>
                        updateEntry(entry.id, { name: e.target.value })
                      }
                      placeholder="e.g. SOUTHSTREAM - ASSET TRACE"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Link (GitHub / demo)</label>
                    <input
                      className={inputClass}
                      value={entry.link || ""}
                      onChange={(e) =>
                        updateEntry(entry.id, { link: e.target.value })
                      }
                      placeholder="github.com/you/project"
                    />
                  </div>
                </div>

                {/* Description & Bullets */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Description
                    </label>

                    {/* Refine with AI Button */}
                    <button
                      type="button"
                      onClick={() => handleRefineWithAi(entry)}
                      disabled={isRefining}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold text-white shadow-xs bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      title="Refine bullets with AI"
                    >
                      {isRefining ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Refining…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Refine with AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bullet Points List */}
                  <div className="space-y-2">
                    {entry.bullets.map((bullet, bulletIndex) => (
                      <BulletItem
                        key={bulletIndex}
                        bullet={bullet}
                        index={bulletIndex}
                        onUpdate={(text) => {
                          const bullets = entry.bullets.slice();
                          bullets[bulletIndex] = text;
                          updateEntry(entry.id, { bullets });
                        }}
                        onRemove={() => {
                          const bullets = entry.bullets.filter(
                            (_, i) => i !== bulletIndex
                          );
                          updateEntry(entry.id, { bullets });
                        }}
                        handleProps={{}}
                        cardProps={{}}
                        isOver={false}
                      />
                    ))}
                  </div>

                  {/* Add point button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateEntry(entry.id, {
                          bullets: [...entry.bullets, ""],
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add point</span>
                    </button>
                  </div>

                  {/* Helper Tip Text */}
                  <p className="text-[11.5px] leading-relaxed text-slate-400 pt-0.5">
                    Each point becomes a bullet on the resume. Select text and press
                    ⌘+B (Ctrl+B on Windows) to bold it.
                  </p>
                </div>

                {/* Technologies Section */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800">
                    Technologies
                  </label>

                  {/* Technology Input Row */}
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={techDrafts[entry.id] || ""}
                      onChange={(e) =>
                        setTechDrafts((prev) => ({
                          ...prev,
                          [entry.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechnology(entry.id);
                        }
                      }}
                      placeholder="e.g. Next.js, PostgreSQL"
                    />

                    <button
                      type="button"
                      onClick={() => addTechnology(entry.id)}
                      className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Technology Pills (Black Badges) */}
                  {entry.technologies && entry.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.technologies.map((tech, techIndex) => (
                        <span
                          key={`${tech}-${techIndex}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-slate-800 select-none"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => removeTechnology(entry.id, techIndex)}
                            aria-label={`Remove ${tech}`}
                            className="rounded-full p-0.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Project Button */}
      <button
        type="button"
        onClick={() => dispatch({ type: "ADD_ENTRY", sectionId })}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-3 px-4 text-xs font-bold text-slate-600 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="h-4 w-4 text-indigo-600" />
        <span>Add project</span>
      </button>

      {/* AI Bullets Refinement Modal */}
      {refineModalData && (
        <ProjectRefineModal
          isOpen={Boolean(refineModalData)}
          projectName={refineModalData.projectName}
          oldBullets={refineModalData.oldBullets}
          newBullets={refineModalData.newBullets}
          onUseNewBullets={applyRefinedBullets}
          onKeepOriginal={() => setRefineModalData(null)}
        />
      )}
    </div>
  );
}
