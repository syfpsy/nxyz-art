import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WRITING, getWriting } from "@/content/writing";
import { Mono } from "@/components/mono";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WRITING.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const w = getWriting(slug);
  if (!w) return { title: "Not found" };
  return { title: w.title, description: w.dek };
}

export default async function WritingEntry({ params }: Params) {
  const { slug } = await params;
  const w = getWriting(slug);
  if (!w) notFound();

  return (
    <article>
      <section style={{ padding: "64px 24px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 14,
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: 14,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <Mono>NOTE · {w.n}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{w.date}</Mono>
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              {w.readingMinutes} min read
            </Mono>
            <Link
              href="/writing"
              className="t-label link"
              style={{ marginLeft: "auto", color: "var(--fg-secondary)" }}
            >
              ← back
            </Link>
          </div>
          <h1
            className="t-h1"
            style={{
              marginTop: 28,
              fontWeight: 500,
              fontSize: "clamp(36px, 4vw, 56px)",
              letterSpacing: "-0.02em",
            }}
          >
            {w.title}
          </h1>
          <p
            style={{
              marginTop: 14,
              color: "var(--fg-secondary)",
              fontSize: 19,
              lineHeight: 1.45,
              textWrap: "balance",
            }}
          >
            {w.dek}
          </p>
        </div>
      </section>

      <section style={{ padding: "32px 24px 96px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="prose">
            {w.body ? (
              <p>{w.body}</p>
            ) : (
              <p>
                The full note is being edited. Check back soon — or write to the
                studio if you&rsquo;d like an early draft.
              </p>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
