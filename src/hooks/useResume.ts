"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { resumeReducer } from "@/lib/resumeReducer";
import { createDefaultResume } from "@/lib/defaultResume";
import type { ResumeState } from "@/lib/types";

const STORAGE_KEY = "resume-draft";
const SAVE_DEBOUNCE_MS = 400;

export function useResume() {
  const [state, dispatch] = useReducer(resumeReducer, undefined, () =>
    createDefaultResume()
  );
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ResumeState;
        dispatch({ type: "LOAD", state: parsed });
      }
    } catch {
      // ignore corrupt/unavailable storage, keep default seed state
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore storage write failures (e.g. quota, privacy mode)
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  return { state, dispatch, hydrated };
}
