// Products — software and tools shipped by the studio.
// Ongoing works, in contrast to `works.ts` (client projects) and
// `experiments.ts` (sketches).
//
// Data lives in `products.json` so the (dev-only) /admin page can edit it
// as plain JSON. The type definitions stay here alongside a typed loader
// so the rest of the codebase keeps using `import { PRODUCTS }`.

import productsData from "./products.json";

export type ProductStatus =
  | "live"
  | "public-beta"
  | "private-beta"
  | "coming-soon";

export type Product = {
  slug: string;
  n: string;          // catalog number, zero-padded
  name: string;       // display name, as the product writes it
  domain: string;     // bare domain, e.g. "perchlens.com"
  url: string;        // full URL for the live embed + external link
  year: number;       // launch year
  tagline: string;    // one-line, editorial
  summary: string;    // 2-3 sentence paragraph
  disciplines: string[];     // e.g. ["Web app", "Analytics", "Privacy"]
  status: ProductStatus;
  statusNote?: string;       // e.g. "v0.3.4 · public beta"
  accent: string;            // product's own brand hex — used only in small dots
  platforms?: string[];      // "Web", "Windows", "macOS", "Linux"
  features?: string[];       // short bullet highlights
  pricing?: string;          // one-liner, e.g. "Free while in beta"
  /**
   * If set to true, the home-page card uses the static fallback (no iframe).
   * Useful for products that block embedding via X-Frame-Options / CSP.
   */
  embedBlocked?: boolean;
};

export const PRODUCTS: Product[] = productsData as Product[];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
