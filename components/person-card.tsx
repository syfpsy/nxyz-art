import Link from "next/link";
import type { Person } from "@/content/people";
import { Mono } from "./mono";
import { PersonAvatar } from "./person-avatar";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Link
      href={`/people/${person.slug}`}
      className="hover-row person-card-link"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 140px) minmax(0, 1fr)",
        gap: 20,
        alignItems: "start",
        padding: "20px 0",
        borderBottom: "1px solid var(--border-subtle)",
        color: "inherit",
      }}
    >
      <PersonAvatar name={person.name} photoSrc={person.photoSrc} sizes="140px" />
      <div style={{ minWidth: 0 }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>{person.n}</Mono>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-0.02em",
            marginTop: 6,
          }}
        >
          {person.name}
        </div>
        <div
          className="t-body"
          style={{
            color: "var(--fg-secondary)",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {person.role}
        </div>
        <span
          className="t-label link"
          style={{
            display: "inline-block",
            marginTop: 12,
            color: "var(--accent)",
          }}
        >
          Profile →
        </span>
      </div>
    </Link>
  );
}
