// Studio facts — referenced by the colophon, footer, nav status, and masthead.

export const STUDIO = {
  name: "nxyz studio",
  mark: "nxyz",
  domain: "nxyz.art",
  email: "info@nxyz.art",
  established: 2022,

  // Location — shown in the clock, correspondence card, and the studio map.
  city: "İstanbul",
  country: "TR",
  coords: "40.9263 N · 29.1518 E",
  lat: 40.9263,
  lng: 29.1518,
  address: [
    "Ritim İstanbul AVM · A Blok 46/50",
    "Cevizli Mah. Zühal Cad.",
    "Maltepe / İstanbul, TR",
  ],
  // Single-line address used for map/search/directions query strings.
  addressQuery:
    "Ritim İstanbul AVM, Cevizli Mah. Zühal Cad. A Blok 46/50, Maltepe, İstanbul",
  timezone: "Europe/Istanbul",

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
