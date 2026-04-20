// Studio facts — referenced by the colophon, footer, nav status, and masthead.

export const STUDIO = {
  name: "nxyz studio",
  mark: "nxyz",
  domain: "nxyz.art",
  email: "studio@nxyz.art",
  established: 2022,

  // Location — shown in the clock and the correspondence card.
  city: "Berlin",
  country: "DE",
  coords: "52.520 N · 13.405 E",
  address: ["Torstraße 172", "10115 Berlin, DE"],
  timezone: "Europe/Berlin",

  // Studio status — "open for work" dot in the nav.
  status: {
    state: "open" as "open" | "booked" | "limited",
    note: "open for work · Q2/26",
    replySla: "avg. reply · 2–3 days",
  },

  // Colophon metadata.
  typefaces: [
    { name: "Space Grotesk", role: "Display & body", source: "Google Fonts" },
    { name: "JetBrains Mono", role: "Labels & metadata", source: "Google Fonts" },
  ],
  tools: [
    "Figma",
    "After Effects",
    "Cinema 4D",
    "Cavalry",
    "VS Code",
    "Glyphs",
    "Linear",
  ],
  links: [
    { label: "↗ are.na", href: "https://are.na" },
    { label: "↗ vimeo", href: "https://vimeo.com" },
    { label: "↗ readme", href: "/colophon" },
  ],
  volume: "Volume I",
  year: 2026,
};
