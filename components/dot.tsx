type DotProps = {
  color?: string;
  size?: number;
  pulse?: boolean;
};

export function Dot({ color = "var(--accent)", size = 6, pulse = false }: DotProps) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        flexShrink: 0,
        boxShadow: pulse ? `0 0 0 0 ${color}` : undefined,
        animation: pulse ? "nxyz-pulse 2.2s var(--ease-standard) infinite" : undefined,
      }}
    />
  );
}
