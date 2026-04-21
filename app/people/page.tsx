import type { Metadata } from "next";
import { PEOPLE } from "@/content/people";
import { Mono } from "@/components/mono";
import { PersonCard } from "@/components/person-card";

export const metadata: Metadata = {
  title: "People",
  description:
    "People working with nxyz — personal profiles alongside the studio volume. Faces, links, and work in one place.",
};

export default function PeopleIndexPage() {
  return (
    <>
      <section
        style={{
          padding: "clamp(40px, 8vw, 72px) clamp(16px, 4vw, 24px) 24px",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · D</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 800 }}
          >
            A studio is a network, not a logo.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
            }}
          >
            Volume I is filed by the group behind it. Each profile is a
            small portfolio — a face, a line of work, and studio projects that
            person shaped — so collaborators read as people first, bylines
            second.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "0 clamp(16px, 4vw, 24px) 64px",
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          {PEOPLE.length === 0 ? (
            <p
              className="t-body"
              style={{ color: "var(--fg-secondary)", padding: "32px 0" }}
            >
              No public profiles yet. Add entries in{" "}
              <code
                className="t-mono"
                style={{ fontSize: 13, color: "var(--fg-primary)" }}
              >
                content/people.json
              </code>
              .
            </p>
          ) : (
            <div className="people-list">
              {PEOPLE.map((p) => (
                <PersonCard key={p.slug} person={p} />
              ))}
            </div>
          )}
        </div>
        <style>{`
          @media (max-width: 600px) {
            .person-card-link {
              grid-template-columns: 1fr !important;
            }
            .person-card-link > div:first-of-type {
              max-width: 220px;
            }
          }
        `}</style>
      </section>
    </>
  );
}
