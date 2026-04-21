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
    <header className="site-nav">
      <Link
        href="/"
        className="site-nav-brand"
        style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}
      >
        <Wordmark variant="full" size={17} />
      </Link>

      <div className="site-nav-cmd">
        <CommandBar renderTrigger />
      </div>

      <div className="site-nav-meta">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
          className="nav-status"
        >
          <Dot color="var(--status-live)" pulse />
          <span
            className="t-label nav-status-label"
            style={{ color: "var(--fg-secondary)" }}
          >
            {STUDIO.status.note}
          </span>
        </span>
        <span className="nav-clock">
          <StudioClock />
        </span>
        <ThemeToggle />
      </div>

      <style>{`
        .site-nav {
          position: sticky;
          top: 0;
          z-index: 30;
          padding: 14px clamp(16px, 4vw, 24px);
          align-items: center;
          gap: 16px 20px;
          background: color-mix(in srgb, var(--bg-base) 88%, transparent);
          backdrop-filter: blur(24px) saturate(1.2);
          -webkit-backdrop-filter: blur(24px) saturate(1.2);
          border-bottom: 1px solid var(--border-subtle);
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
        }
        .site-nav-brand { justify-self: start; }
        .site-nav-cmd {
          max-width: 520px;
          width: 100%;
          justify-self: center;
          min-width: 0;
        }
        .site-nav-meta {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 18px);
          flex-wrap: nowrap;
          justify-self: end;
          min-width: 0;
        }
        @media (max-width: 960px) {
          .nav-clock { display: none; }
        }
        /* Narrow viewports: stack brand + status row, full-width command bar.
           Prevents the three-column squeeze that overlapped ⌘K on the status strip. */
        @media (max-width: 768px) {
          .site-nav {
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-rows: auto auto;
            grid-template-areas:
              "brand meta"
              "cmd cmd";
            gap: 10px 12px;
            padding-top: 12px;
            padding-bottom: 12px;
          }
          .site-nav-brand { grid-area: brand; }
          .site-nav-cmd {
            grid-area: cmd;
            max-width: none;
            justify-self: stretch;
          }
          .site-nav-meta { grid-area: meta; }
          .nav-status {
            max-width: min(200px, 46vw);
          }
          .nav-status-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11px;
            letter-spacing: 0.02em;
          }
        }
      `}</style>
    </header>
  );
}
