/**
 * Low-opacity grain overlay. Use sparingly — only on inverse sections.
 * Server-renderable: pure inline SVG, no client JS.
 */
type GrainProps = {
  opacity?: number; // 0.02 – 0.05 is the brand-safe range
};

export function Grain({ opacity = 0.035 }: GrainProps) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)' opacity='1'/>
  </svg>`;
  const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        backgroundImage: `url("${encoded}")`,
        backgroundRepeat: "repeat",
        mixBlendMode: "overlay",
        zIndex: 1,
      }}
    />
  );
}
