"use client";

import { useSyncExternalStore } from "react";

/*
 * UI language preference (English / Hausa), shared by every LanguageSwitch
 * and any component that reads it. Persisted in localStorage; the server
 * always renders English, and the stored choice is applied right after
 * hydration (useSyncExternalStore's server snapshot), so there is no
 * hydration mismatch.
 *
 * Only the landing page is translated so far (see landing-messages.ts).
 */
export const LOCALES = ["en", "ha"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "kooltech:locale";
const listeners = new Set<() => void>();
// Used only when localStorage is unavailable, so the switch still works
// for the current page view.
let memoryLocale: Locale = "en";

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : "en";
  } catch {
    return memoryLocale;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage blocked (private mode etc.): fall back to memory.
  }
  memoryLocale = locale;
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    subscribe,
    readLocale,
    () => "en",
  );
}
