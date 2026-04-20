import type { CSSProperties } from "react";

type WordmarkProps = {
  variant?: "full" | "short";
  size?: number;                  // baseline font-size in px
  tone?: "light" | "dark";        // controls color on inverse backgrounds
  accentDot?: boolean;
  style?: CSSProperties;
};

/**
 * Typographic wordmark for nxyz / nxyz studio.
 * Per NAME_USAGE.md: no decoration, just Space Grotesk + a single accent dot.
 */
export function Wordmark({
  variant = "full",
  size = 17,
  tone = "light",
  accentDot = true,
  style,
}: WordmarkProps) {
  const fg = tone === "dark" ? "var(--fg-inverse)" : "var(--fg-primary)";
  const sub = tone === "dark" ? "rgba(243,245,247,0.68)" : "var(--fg-secondary)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.03em",
        color: fg,
        lineHeight: 1,
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.14 }}>
        nxyz
        {accentDot && (
          <span
            aria-hidden
            style={{
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
              transform: `translateY(${size * 0.24}px)`,
            }}
          />
        )}
      </span>
      {variant === "full" && (
        <span style={{ color: sub, fontWeight: 500 }}>studio</span>
      )}
    </span>
  );
}
