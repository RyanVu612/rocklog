"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Light/dark toggle. The actual pre-paint theme resolution happens in the
 * inline script in layout.tsx (so there's no flash); this control just reads
 * the current state from the <html> class, flips it, and persists the choice.
 */
export function ThemeToggle() {
  // null until mounted so server and first client render match (no hydration
  // mismatch); the real icon appears after the effect reads the DOM.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("rl-theme", next);
    } catch {
      // Storage may be blocked (private mode); the toggle still works for the
      // session, it just won't persist.
    }
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-md border border-edge px-2 py-1 text-sm text-muted transition hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {/* Keep width stable before mount to avoid layout shift. */}
      <span aria-hidden="true">{theme === null ? " " : isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
