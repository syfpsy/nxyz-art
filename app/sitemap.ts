import type { MetadataRoute } from "next";
import { WORKS } from "@/content/works";
import { PRODUCTS } from "@/content/products";
import { EXPERIMENTS } from "@/content/experiments";
import { WRITING } from "@/content/writing";
import { PEOPLE } from "@/content/people";

const BASE = "https://nxyz.art";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    "",
    "/work",
    "/products",
    "/people",
    "/lab",
    "/writing",
    "/colophon",
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...WORKS.map((w) => ({
      url: `${BASE}/work/${w.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...PRODUCTS.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...EXPERIMENTS.map((e) => ({
      url: `${BASE}/lab/${e.slug}`,
      lastModified: new Date(e.date),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...WRITING.map((w) => ({
      url: `${BASE}/writing/${w.slug}`,
      lastModified: new Date(w.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...PEOPLE.map((p) => ({
      url: `${BASE}/people/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}
