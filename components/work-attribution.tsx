"use client";

import { getPerson } from "@/content/people";
import type { Work } from "@/content/works";

const OVERLAP = 7;

type WorkAttributionStackProps = {
  work: Work;
  /** Diameter in px */
  size?: number;
  position?: "top-right" | "inline";
  style?: React.CSSProperties;
  /** e.g. filmstrip active frame — triggers a one-shot pop animation */
  className?: string;
};

/**
 * Stacked circle avatars for work creators. Uses person photos when set;
 * otherwise initials or a placeholder. Unknown `personSlugs` show "?".
 */
export function WorkAttributionStack({
  work,
  size = 28,
  position = "top-right",
  style,
  className,
}: WorkAttributionStackProps) {
  const slugs = work.personSlugs;
  if (!slugs?.length) return null;

  return (
    <div
      role="group"
      aria-label={`Creators: ${slugs
        .map((s) => getPerson(s)?.name ?? s)
        .join(", ")}`}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        ...(position === "top-right"
          ? { position: "absolute", top: 8, right: 8, zIndex: 3 }
          : { position: "relative" }),
        pointerEvents: "none",
        ...style,
      }}
    >
      {slugs.map((slug, i) => (
        <div
          key={slug}
          style={{
            marginLeft: i === 0 ? 0 : -OVERLAP,
            zIndex: i + 1,
            position: "relative",
          }}
        >
          <PersonCircle slug={slug} size={size} />
        </div>
      ))}
    </div>
  );
}

function PersonCircle({ slug, size }: { slug: string; size: number }) {
  const p = getPerson(slug);
  const label = p?.name ?? slug;
  const initials = p
    ? p.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("")
    : "?";

  const border = "2px solid var(--border-subtle, rgba(0,0,0,0.2))";
  if (p?.photoSrc) {
    return (
      <span
        title={label}
        style={{ display: "block", lineHeight: 0, borderRadius: "50%" }}
      >
        {/* Creators: arbitrary public paths, not in next/image config */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.photoSrc}
          alt=""
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            boxSizing: "border-box",
            border,
            background: "var(--bg-elevated)",
          }}
        />
      </span>
    );
  }

  return (
    <span
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        boxSizing: "border-box",
        border,
        background: "var(--fg-tertiary)",
        color: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: size > 32 ? 13 : 10,
        letterSpacing: "-0.04em",
      }}
    >
      {initials}
    </span>
  );
}
