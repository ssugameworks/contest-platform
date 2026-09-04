"use client";

import { useEffect, useRef } from "react";
import type { UseFormWatch } from "react-hook-form";
import type { ApplicationFormInput } from "../model/schema";

const DRAFT_KEY = "submit-application-draft";

export function loadApplicationDraft(): Partial<ApplicationFormInput> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearApplicationDraft(): void {
  window.localStorage.removeItem(DRAFT_KEY);
}

// Losing a half-filled form to an accidental refresh/back-navigation is one
// of the biggest blockers for a form this long, so every change gets
// persisted to localStorage without the user doing anything.
export function useApplicationDraftAutosave(
  watch: UseFormWatch<ApplicationFormInput>,
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const subscription = watch((value) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [watch]);
}
