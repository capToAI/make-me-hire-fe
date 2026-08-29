"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { resumeReducer } from "@/lib/resumeReducer";
import { createDefaultResume } from "@/lib/defaultResume";
import { fetchResumeById, updateResumeRecord } from "@/lib/api";
import type { ResumeState } from "@/lib/types";

const STORAGE_KEY = "resume-draft";
const SAVE_DEBOUNCE_MS = 600;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useResume(resumeId?: string | null) {
  const [state, dispatch] = useReducer(resumeReducer, undefined, () =>
    createDefaultResume()
  );
  const [hydrated, setHydrated] = useState(false);
  const [resumeName, setResumeName] = useState("Untitled Resume");
  const [position, setPosition] = useState("General");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);

  // 1. Initial Load: from Database if resumeId provided, else LocalStorage
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (resumeId) {
        try {
          const res = await fetchResumeById(resumeId);
          if (isCancelled) return;

          if (res.success && res.data) {
            setResumeName(res.data.name || "Untitled Resume");
            setPosition(res.data.position || "General");
            if (res.data.data) {
              dispatch({ type: "LOAD", state: res.data.data });
            }
            setSaveStatus("saved");
            setLastSavedAt(new Date(res.data.updatedAt));
          } else {
            setLoadError(res.error || "Could not load resume data from database.");
            setSaveStatus("error");
          }
        } catch (err: unknown) {
          if (isCancelled) return;
          const msg = err instanceof Error ? err.message : "Failed to load resume";
          setLoadError(msg);
          setSaveStatus("error");
        } finally {
          if (!isCancelled) {
            setHydrated(true);
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, 100);
          }
        }
      } else {
        // Fallback: load draft from LocalStorage
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as ResumeState;
            dispatch({ type: "LOAD", state: parsed });
          }
        } catch {
          // ignore storage parse failures
        } finally {
          setHydrated(true);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 100);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [resumeId]);

  // 2. Immediate manual save helper
  // Helper to extract candidate name and role from resume basic section
  const getDerivedMeta = useCallback(
    (currentState: ResumeState) => {
      const basicSection = Object.values(currentState.sections || {}).find(
        (s) => s && (s.type === "basic" || s.id?.includes("basic"))
      );
      const basicData = basicSection?.data as { name?: string; jobTitle?: string } | undefined;
      const derivedName = basicData?.name?.trim()
        ? `${basicData.name.trim()} Resume`
        : resumeName || "Untitled Resume";
      const derivedPosition = basicData?.jobTitle?.trim() || position || "General";
      return { derivedName, derivedPosition };
    },
    [resumeName, position]
  );

  // 2. Immediate manual save helper
  const saveNow = useCallback(async () => {
    if (!resumeId) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    const { derivedName, derivedPosition } = getDerivedMeta(state);
    setResumeName(derivedName);
    setPosition(derivedPosition);

    setSaveStatus("saving");
    try {
      const res = await updateResumeRecord(resumeId, {
        name: derivedName,
        position: derivedPosition,
        data: state,
      });

      if (res.success) {
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [resumeId, getDerivedMeta, state]);

  // 3. Debounced Auto-Save
  useEffect(() => {
    if (!hydrated || isInitialLoadRef.current) return;

    // Also persist to local draft as offline protection
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota or private mode fallback
    }

    const { derivedName, derivedPosition } = getDerivedMeta(state);
    setResumeName(derivedName);
    setPosition(derivedPosition);

    if (!resumeId) return;

    setSaveStatus("saving");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await updateResumeRecord(resumeId, {
          name: derivedName,
          position: derivedPosition,
          data: state,
        });

        if (res.success) {
          setSaveStatus("saved");
          setLastSavedAt(new Date());
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated, resumeId, getDerivedMeta]);

  return {
    state,
    dispatch,
    hydrated,
    resumeName,
    setResumeName,
    position,
    setPosition,
    saveStatus,
    lastSavedAt,
    loadError,
    saveNow,
  };
}
