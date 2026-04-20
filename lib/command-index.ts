import { WORKS } from "@/content/works";
import { EXPERIMENTS } from "@/content/experiments";
import { WRITING } from "@/content/writing";
import { PRODUCTS } from "@/content/products";
import { STUDIO } from "@/content/studio";

export type CommandKind =
  | "page"
  | "work"
  | "product"
  | "lab"
  | "writing"
  | "action";

export type CommandItem = {
  id: string;
  kind: CommandKind;
  label: string;
  hint?: string;
  href?: string;
  action?: () => void;
};

export function buildCommandIndex(): CommandItem[] {
  const pages: CommandItem[] = [
    { id: "p-home", kind: "page", label: "Go to: index", href: "/" },
    { id: "p-work", kind: "page", label: "Go to: work archive", href: "/work" },
    { id: "p-products", kind: "page", label: "Go to: the shop", href: "/products" },
    { id: "p-lab", kind: "page", label: "Go to: experiments lab", href: "/lab" },
    { id: "p-writing", kind: "page", label: "Go to: writing", href: "/writing" },
    { id: "p-colophon", kind: "page", label: "Go to: colophon", href: "/colophon" },
  ];

  const works = WORKS.map<CommandItem>((w) => ({
    id: `w-${w.slug}`,
    kind: "work",
    label: `Open: ${w.title} · ${w.kind.toLowerCase()} · ${w.year}`,
    hint: w.n,
    href: `/work/${w.slug}`,
  }));

  const products = PRODUCTS.map<CommandItem>((p) => ({
    id: `pr-${p.slug}`,
    kind: "product",
    label: `Open: ${p.name} · ${p.domain}`,
    hint: p.n,
    href: `/products/${p.slug}`,
  }));

  const experiments = EXPERIMENTS.map<CommandItem>((e) => ({
    id: `l-${e.slug}`,
    kind: "lab",
    label: `Open: ${e.title} · ${e.kind.toLowerCase()}`,
    hint: e.n,
    href: `/lab/${e.slug}`,
  }));

  const writing = WRITING.map<CommandItem>((w) => ({
    id: `r-${w.slug}`,
    kind: "writing",
    label: `Read: ${w.title}`,
    hint: w.date,
    href: `/writing/${w.slug}`,
  }));

  const actions: CommandItem[] = [
    {
      id: "a-mail",
      kind: "action",
      label: `Mail: ${STUDIO.email}`,
      hint: "↗",
      href: `mailto:${STUDIO.email}`,
    },
    {
      id: "a-subscribe",
      kind: "action",
      label: "Subscribe to the studio's press sheet",
      hint: "↓",
      href: "/#subscribe",
    },
    {
      id: "a-map",
      kind: "action",
      label: "Open studio location in Maps",
      hint: "↗",
      href: "/colophon#correspondence",
    },
    {
      id: "a-admin",
      kind: "action",
      label: "Admin: edit works & products (dev only)",
      hint: "/",
      href: "/admin",
    },
  ];

  return [...pages, ...products, ...works, ...experiments, ...writing, ...actions];
}
