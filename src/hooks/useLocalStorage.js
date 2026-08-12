// ============================================================
// 🪝 hooks/useLocalStorage.js
// ============================================================
// NEW HOOK — A reusable hook that syncs any state value
// with the browser's localStorage automatically.
//
// 🧠 WHY BUILD THIS?
// The pattern of "load from storage on mount, save on change"
// appears in many places: cart, theme, user preferences, form drafts.
// Instead of writing useEffect + localStorage in every component,
// we extract it into one reusable hook.
//
// 🧠 REAL-WORLD ANALOGY:
// Like a notebook that automatically saves whatever you write.
// You just write (set state) — the saving happens behind the scenes.
// When you open the notebook again (page reload), your notes are there.
// ============================================================

import { useState, useEffect } from "react";

export function useLocalStorage(key, defaultValue) {
  // ─────────────────────────────────────────────────────────
  // Lazy initializer: read from localStorage on first render only
  // ─────────────────────────────────────────────────────────
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      // If something is stored, parse it (it's stored as JSON string)
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      // If parsing fails (corrupted data), use the default
      return defaultValue;
    }
  });

  // ─────────────────────────────────────────────────────────
  // useEffect: every time `value` changes, write to localStorage
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Could not save "${key}" to localStorage`);
    }
  }, [key, value]); // re-run when key or value changes

  // Return exactly like useState: [value, setter]
  return [value, setValue];
}