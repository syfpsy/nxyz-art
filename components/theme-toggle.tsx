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

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${label} mode`}
      className="t-label"
      style={{
        padding: "6px 10px",
        border: "1px solid var(--border-subtle)",
        borderRadius: 6,
        color: "var(--fg-secondary)",
        background: "transparent",
        transition: "all var(--dur-base) var(--ease-standard)",
        lineHeight: 1,
        letterSpacing: "0.14em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--fg-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.color = "var(--fg-secondary)";
      }}
    >
      {theme === null ? "—" : label}
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
