import type { ReactNode } from "react";
import { Mono } from "./mono";

type SectionHeaderProps = {
  index: string;       // e.g. "A", "B", "01"
  prefix?: string;     // default "INDEX"
  meta?: string;       // trailing mono meta, e.g. "2022 – 2026"
  children: ReactNode; // the sentence-case title
};

/**
 * The signature layout cue: mono INDEX label above a sentence-case title,
 * hung under a black top rule.
 */
export function SectionHeader({ index, prefix = "INDEX", meta, children }: SectionHeaderProps) {
  return (
    <div className="section-header-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <Mono>
          {prefix} · {index}
          {meta ? ` · ${meta}` : ""}
        </Mono>
      </div>
      <h2
        className="t-h2 section-header-title"
        style={{
          fontWeight: 500,
          lineHeight: 1.08,
          minWidth: 0,
        }}
      >
        {children}
      </h2>
      <style>{`
        .section-header-grid {
          display: grid;
          grid-template-columns: minmax(140px, 1fr) minmax(0, 2fr);
          gap: clamp(16px, 4vw, 32px);
          border-top: 1px solid var(--fg-primary);
          padding-top: 18px;
          margin-bottom: 40px;
        }
        @media (max-width: 640px) {
          .section-header-grid {
            grid-template-columns: 1fr;
            gap: 14px;
            padding-top: 14px;
            margin-bottom: 28px;
          }
          .section-header-title {
            text-align: left;
            font-size: clamp(22px, 6.5vw, 28px) !important;
          }
        }
      `}</style>
    </div>
  );
}
