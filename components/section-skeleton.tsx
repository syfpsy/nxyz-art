/**
 * Minimal placeholder for `next/dynamic` loading= on the home page.
 * Fixed min-height reduces layout shift while the async chunk streams in.
 */
export function SectionSkeleton({ minHeight }: { minHeight: number }) {
  return (
    <div
      aria-hidden
      className="home-section-skeleton"
      style={{
        minHeight,
        width: "100%",
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    />
  );
}
