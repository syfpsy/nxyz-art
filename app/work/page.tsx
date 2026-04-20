import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { Mono } from "@/components/mono";
import { WORKS } from "@/content/works";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected work by nxyz studio, 2022 – present. Filed by year.",
};

export default function WorkArchive() {
  const byYear = WORKS.reduce<Record<number, number>>((acc, w) => {
    acc[w.year] = (acc[w.year] ?? 0) + 1;
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <>
      <section style={{ padding: "72px 24px 32px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <Mono style={{ color: "var(--fg-tertiary)" }}>SECTION · A</Mono>
          <h1
            className="t-h1"
            style={{ marginTop: 12, fontWeight: 500, maxWidth: 880 }}
          >
            Selected work, filed by year.
          </h1>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              maxWidth: 640,
              marginTop: 18,
            }}
          >
            The studio takes a small number of projects each year. Listed below are the
            works that made it out of the shop. Cross-referenced by medium, dated by
            final handover.
          </p>
          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            {years.map((y) => (
              <Mono key={y} style={{ color: "var(--fg-secondary)" }}>
                {y} · {String(byYear[y]).padStart(2, "0")}
              </Mono>
            ))}
          </div>
        </div>
      </section>
      <Catalog title="The archive, in full." />
    </>
  );
}
