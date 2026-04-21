import type { CSSProperties, ReactNode } from "react";

type MonoProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: "span" | "div" | "p";
  id?: string;
  role?: string;
  "aria-live"?: "off" | "polite" | "assertive";
};

export function Mono({
  children,
  style,
  className,
  as = "span",
  id,
  role,
  "aria-live": ariaLive,
}: MonoProps) {
  const Tag = as;
  return (
    <Tag
      id={id}
      role={role}
      aria-live={ariaLive}
      className={["t-label", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </Tag>
  );
}
