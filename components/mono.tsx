import type { CSSProperties, ReactNode } from "react";

type MonoProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: "span" | "div" | "p";
};

export function Mono({ children, style, className, as = "span" }: MonoProps) {
  const Tag = as;
  return (
    <Tag className={["t-label", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </Tag>
  );
}
