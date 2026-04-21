import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPerson, getWorksForPerson } from "@/content/people";
import { PEOPLE } from "@/content/people";
import { Mono } from "@/components/mono";
import { PersonAvatar } from "@/components/person-avatar";
import { FrameGlyph, frameBackground } from "@/components/frame-glyph";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const person = getPerson(slug);
  if (!person) return { title: "Not found" };
  return {
    title: `${person.name} · people`,
    description: person.tagline,
  };
}

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export default async function PersonPage({ params }: Params) {
  const { slug } = await params;
  const person = getPerson(slug);
  if (!person) notFound();

  const works = getWorksForPerson(person);
  const other = person.otherWork ?? [];

  return (
    <article>
      <section style={{ padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: 16,
              alignItems: "baseline",
            }}
          >
            <Link href="/people" className="t-label link" style={{ color: "var(--fg-secondary)" }}>
              ← people
            </Link>
            <Mono>PROFILE · {person.n}</Mono>
            <Link
              href="/work"
              className="t-label link"
              style={{ marginLeft: "auto", color: "var(--fg-tertiary)" }}
            >
              studio work →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
              gap: "clamp(24px, 4vw, 48px)",
              marginTop: 32,
            }}
            className="person-profile-grid"
          >
            <div style={{ maxWidth: 400 }}>
              <PersonAvatar
                name={person.name}
                photoSrc={person.photoSrc}
                sizes="(max-width: 900px) 88vw, 400px"
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1
                className="t-h1"
                style={{ fontWeight: 500, lineHeight: 1.1, maxWidth: 640 }}
              >
                {person.name}
              </h1>
              <p
                className="t-mono"
                style={{
                  color: "var(--fg-secondary)",
                  fontSize: 13,
                  marginTop: 12,
                  letterSpacing: "0.02em",
                }}
              >
                {person.role}
              </p>
              <p
                className="t-body"
                style={{
                  color: "var(--fg-secondary)",
                  marginTop: 20,
                  fontSize: 17,
                  lineHeight: 1.55,
                  maxWidth: 520,
                }}
              >
                {person.tagline}
              </p>
              {person.links.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 24,
                  }}
                >
                  {person.links.map((l) => (
                    <a
                      key={l.label + l.href}
                      href={l.href}
                      className="t-label link"
                      target={isExternal(l.href) ? "_blank" : undefined}
                      rel={isExternal(l.href) ? "noreferrer" : undefined}
                      style={{ color: "var(--accent)" }}
                    >
                      {l.label}
                      {isExternal(l.href) ? " ↗" : " →"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .person-profile-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 600px) {
            .person-work-row {
              grid-template-columns: 1fr 48px !important;
            }
            .person-work-row > div:first-of-type {
              display: none;
            }
          }
        `}</style>
      </section>

      <section
        style={{
          padding: "24px 24px 48px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}
        >
          <Mono style={{ color: "var(--fg-tertiary)" }}>ABOUT</Mono>
          {person.bio.map((para, i) => (
            <p
              key={i}
              className="t-body"
              style={{
                color: "var(--fg-primary)",
                maxWidth: 720,
                marginTop: 16,
                fontSize: 16,
                lineHeight: 1.65,
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </section>

      {works.length > 0 && (
        <section
          style={{
            padding: "48px 24px 64px",
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
            <Mono style={{ color: "var(--fg-tertiary)" }}>WITH NXYZ</Mono>
            <h2
              className="t-h2"
              style={{ marginTop: 10, fontWeight: 500, maxWidth: 520 }}
            >
              Studio work on this volume.
            </h2>
            <div
              className="person-works-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                marginTop: 24,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              {works.map((w) => (
                <Link
                  key={w.slug}
                  href={`/work/${w.slug}`}
                  className="hover-row person-work-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap: 20,
                    alignItems: "center",
                    padding: "20px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 10",
                      borderRadius: 4,
                      overflow: "hidden",
                      background: frameBackground(w.tone),
                    }}
                  >
                    <FrameGlyph work={w} size="fill" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        fontSize: 18,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {w.title}
                    </div>
                    <Mono
                      style={{
                        color: "var(--fg-secondary)",
                        fontSize: 12,
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      {w.kind} · {w.year}
                    </Mono>
                  </div>
                  <Mono style={{ color: "var(--fg-tertiary)" }}>{w.n}</Mono>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {other.length > 0 && (
        <section style={{ padding: "48px 24px 80px" }}>
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
            <Mono style={{ color: "var(--fg-tertiary)" }}>ALSO</Mono>
            <h2
              className="t-h2"
              style={{ marginTop: 10, fontWeight: 500, maxWidth: 520 }}
            >
              Projects beyond the case-file.
            </h2>
            <ul
              style={{
                margin: "20px 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {other.map((o) => (
                <li key={o.title + o.href}>
                  <a
                    href={o.href}
                    className="t-body"
                    target={isExternal(o.href) ? "_blank" : undefined}
                    rel={isExternal(o.href) ? "noreferrer" : undefined}
                    style={{
                      color: "var(--fg-primary)",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {o.title}
                    {o.year && (
                      <span style={{ color: "var(--fg-tertiary)" }}>
                        {" "}
                        · {o.year}
                      </span>
                    )}
                    {isExternal(o.href) ? " ↗" : " →"}
                  </a>
                  {o.note && (
                    <p
                      className="t-body"
                      style={{
                        color: "var(--fg-secondary)",
                        margin: "6px 0 0",
                        fontSize: 14,
                        maxWidth: 560,
                      }}
                    >
                      {o.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section style={{ padding: "0 24px 64px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Link href="/people" className="t-label link" style={{ color: "var(--fg-secondary)" }}>
            ← all people
          </Link>
        </div>
      </section>
    </article>
  );
}
