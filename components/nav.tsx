import Link from "next/link";
import { STUDIO } from "@/content/studio";
import { Wordmark } from "./wordmark";
import { Dot } from "./dot";
import { CommandBar } from "./command-bar";
import { StudioClock } from "./studio-clock";
import { ThemeToggle } from "./theme-toggle";

/**
 * Sticky masthead nav. No traditional menu — just the wordmark,
 * a command bar, and the live studio status strip.
 */
export function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: "14px 24px",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 20,
        background: "color-mix(in srgb, var(--bg-base) 88%, transparent)",
        backdropFilter: "blur(24px) saturate(1.2)",
        WebkitBackdropFilter: "blur(24px) saturate(1.2)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
        <Wordmark variant="full" size={17} />
      </Link>

      <div style={{ maxWidth: 520, width: "100%", justifySelf: "center" }}>
        <CommandBar renderTrigger />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
          }}
          className="nav-status"
        >
          <Dot color="var(--status-live)" pulse />
          <span className="t-label" style={{ color: "var(--fg-secondary)" }}>
            {STUDIO.status.note}
          </span>
        </span>
        <span className="nav-clock">
          <StudioClock />
        </span>
        <ThemeToggle />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .nav-clock { display: none; }
        }
        @media (max-width: 720px) {
          .nav-status { display: none; }
        }
      `}</style>
    </header>
  );
}
