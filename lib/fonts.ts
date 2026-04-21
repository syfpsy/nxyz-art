import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

// Only weights used in the UI (see frame-glyph + globals). Saves ~1 WOFF2 per family.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
  adjustFontFallback: true,
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  adjustFontFallback: true,
});
