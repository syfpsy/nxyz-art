"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "nxyz-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null;
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const label = theme === "dark" ? "light" : "dark";

  // Pre-hydration we don't know the theme in this component — but the
  // inline ThemeScript in <head> already wrote `data-theme` to <html>.
  // Reading that attribute gives us the correct first paint label without
  // waiting for the hydration round-trip, so we never show the "—" dash.
  const preHydrationLabel = (): string => {
    if (typeof document === "undefined") return "dark";
    const t = document.documentElement.getAttribute("data-theme");
    return t === "dark" ? "light" : "dark";
  };
  const displayLabel = theme === null ? preHydrationLabel() : label;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${displayLabel} mode`}
      className="t-label"
      style={{
        // Meets WCAG 2.5.8 Minimum Target Size (24x24) with room: the control
        // sits on a busy nav strip so we keep it compact but tap-friendly.
        padding: "10px 14px",
        minWidth: 44,
        minHeight: 36,
        border: "1px solid var(--border-subtle)",
        borderRadius: 6,
        color: "var(--fg-secondary)",
        background: "transparent",
        transition: "all var(--dur-base) var(--ease-standard)",
        lineHeight: 1,
        letterSpacing: "0.14em",
      }}
      // Hover and keyboard focus produce the same affordance — the border
      // lifts and the text darkens. onBlur is guarded so hover state is
      // preserved when the user tabs away from a hovered element.
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--fg-primary)";
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.color = "var(--fg-secondary)";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--fg-primary)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.color = "var(--fg-secondary)";
      }}
    >
      {displayLabel}
    </button>
  );
}

/**
 * Inline script to set the theme before hydration — prevents FOUC.
 * Render this inside the <head>.
 */
export function ThemeScript() {
  const code = `
    (function(){
      try {
        var t = localStorage.getItem('${STORAGE_KEY}');
        if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
        document.documentElement.setAttribute('data-theme', t);
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
