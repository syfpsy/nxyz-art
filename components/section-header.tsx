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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(160px, 1fr) 2fr",
        gap: 32,
        borderTop: "1px solid var(--fg-primary)",
        paddingTop: 18,
        marginBottom: 40,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Mono>
          {prefix} · {index}
          {meta ? ` · ${meta}` : ""}
        </Mono>
      </div>
      <h2
        className="t-h2"
        style={{
          fontWeight: 500,
          lineHeight: 1.08,
        }}
      >
        {children}
      </h2>
    </div>
  );
}
