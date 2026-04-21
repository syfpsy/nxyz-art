import type { Work } from "@/content/works";

/**
 * Abstract, original glyphs used as placeholder hero art for each work.
 * Pure SVG — no bitmap assets. Swap per-work for real imagery when available.
 */
export function FrameGlyph({ work, size = "fill" }: { work: Work; size?: "fill" | "large" }) {
  const stroke = work.tone === "dark" ? "#98A2B3" : "#111214";
  const accent = "#6D5EF7";
  const viewBox = "0 0 200 160";
  const style: React.CSSProperties =
    size === "fill"
      ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
      : { width: "100%", height: "auto", maxHeight: 420 };

  const n = work.n;

  switch (n) {
    case "01":
      return (
        <svg viewBox={viewBox} style={style}>
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            fontSize="48"
            letterSpacing="-2"
            fill={stroke}
          >
            meridian.
          </text>
          <line x1="20" y1="115" x2="180" y2="115" stroke={accent} strokeWidth="1" />
        </svg>
      );
    case "02":
      return (
        <svg viewBox={viewBox} style={style}>
          {/* Only 400/500/600 are loaded in next/font to keep downloads small */}
          {[400, 500, 600, 500, 400].map((w, i) => (
            <text
              key={`${w}-${i}`}
              x="16"
              y={30 + i * 22}
              fontSize="20"
              fontFamily="var(--font-sans)"
              fontWeight={w}
              fill={stroke}
            >
              field
            </text>
          ))}
        </svg>
      );
    case "03":
      return (
        <svg viewBox={viewBox} style={style}>
          <rect x="40" y="30" width="120" height="100" fill="none" stroke={stroke} />
          <circle cx="80" cy="80" r="14" fill={stroke} />
          <circle cx="120" cy="80" r="14" fill={stroke} />
          <rect x="60" y="110" width="80" height="4" fill={accent} />
        </svg>
      );
    case "04":
      return (
        <svg viewBox={viewBox} style={style}>
          <rect x="18" y="20" width="164" height="120" fill="none" stroke={stroke} />
          <rect x="18" y="20" width="164" height="20" fill="#EFEFEA" />
          <line x1="18" y1="60" x2="182" y2="60" stroke="#DFE3EA" />
          <rect x="30" y="72" width="80" height="10" fill={accent} />
          <rect x="30" y="90" width="140" height="4" fill="#DFE3EA" />
          <rect x="30" y="100" width="120" height="4" fill="#DFE3EA" />
        </svg>
      );
    case "05":
      return (
        <svg viewBox={viewBox} style={style}>
          <circle cx="100" cy="80" r="60" fill="none" stroke={stroke} />
          <circle cx="100" cy="80" r="40" fill="none" stroke={stroke} />
          <circle cx="100" cy="80" r="20" fill="none" stroke={accent} />
          <circle cx="140" cy="60" r="3" fill={accent} />
        </svg>
      );
    case "06":
      return (
        <svg viewBox={viewBox} style={style}>
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={20 + i * 20}
              y1="20"
              x2={20 + i * 20}
              y2="140"
              stroke={stroke}
              strokeWidth="0.5"
            />
          ))}
          <rect x="40" y="60" width="120" height="3" fill={accent} />
          <rect x="40" y="90" width="80" height="3" fill={stroke} />
        </svg>
      );
    case "07":
      return (
        <svg viewBox={viewBox} style={style}>
          <polygon points="20,140 100,30 180,140" fill="none" stroke={stroke} />
          <circle cx="100" cy="90" r="20" fill={accent} />
        </svg>
      );
    default:
      return (
        <svg viewBox={viewBox} style={style}>
          <rect x="60" y="30" width="80" height="100" fill={accent} opacity="0.2" />
          <rect x="40" y="50" width="80" height="100" fill="none" stroke={stroke} />
        </svg>
      );
  }
}

export function frameBackground(tone: Work["tone"]) {
  return (
    {
      light: "#EDEEEA",
      soft: "#EEE9FB",
      dark: "#14161C",
      ui: "#FFFFFF",
    } as const
  )[tone];
}
