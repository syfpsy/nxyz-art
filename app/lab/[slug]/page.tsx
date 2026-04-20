import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EXPERIMENTS, getExperiment } from "@/content/experiments";
import { Mono } from "@/components/mono";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const e = getExperiment(slug);
  if (!e) return { title: "Not found" };
  return { title: `${e.title} · lab`, description: e.summary };
}

export default async function ExperimentPage({ params }: Params) {
  const { slug } = await params;
  const e = getExperiment(slug);
  if (!e) notFound();

  return (
    <article>
      <section style={{ padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 18,
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: 18,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <Mono>LAB · {e.n}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{e.date}</Mono>
            <Mono style={{ color: "var(--fg-secondary)" }}>{e.kind}</Mono>
            <Mono
              style={{
                color:
                  e.status === "open"
                    ? "var(--accent)"
                    : e.status === "archived"
                    ? "var(--fg-tertiary)"
                    : "var(--fg-secondary)",
              }}
            >
              · {e.status}
            </Mono>
            <Link
              href="/lab"
              className="t-label link"
              style={{ marginLeft: "auto", color: "var(--fg-secondary)" }}
            >
              ← back to lab
            </Link>
          </div>
          <h1
            className="t-h1"
            style={{ marginTop: 28, fontWeight: 500, maxWidth: 880 }}
          >
            {e.title}
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
              fontSize: 17,
              lineHeight: 1.55,
            }}
          >
            {e.summary}
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "24px 24px 96px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="prose">
            <p>
              {e.body ??
                "No write-up yet. This entry is a placeholder while the sketch is in motion."}
            </p>
            <p>
              The lab intentionally publishes earlier than the archive. Expect rough
              edges, short runs, and the occasional dead end.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
