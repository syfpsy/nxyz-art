import type { Metadata, Viewport } from "next";
import { spaceGrotesk, jetBrainsMono } from "@/lib/fonts";
import { ThemeScript } from "@/components/theme-toggle";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nxyz.art"),
  title: {
    default: "nxyz studio — volume I",
    template: "%s · nxyz studio",
  },
  description:
    "nxyz studio designs motion, systems, and signal. A small studio in İstanbul, working across time zones by way of slow correspondence.",
  applicationName: "nxyz studio",
  authors: [{ name: "nxyz studio" }],
  keywords: [
    "motion design",
    "title sequences",
    "type design",
    "brand systems",
    "product interfaces",
    "nxyz",
    "nxyz studio",
    "nxyz.art",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    type: "website",
    title: "nxyz studio — volume I",
    description:
      "A studio for motion, systems, and signal. Selected work, 2022 – present.",
    siteName: "nxyz studio",
    url: "https://nxyz.art",
  },
  twitter: {
    card: "summary_large_image",
    title: "nxyz studio",
    description:
      "A studio for motion, systems, and signal. Selected work, 2022 – present.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0F12" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Video embeds + map iframe – warm connections early (no feature loss). */}
        <link rel="preconnect" href="https://video.gumlet.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://gumlet.tv" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.openstreetmap.org" />
        <ThemeScript />
      </head>
      <body>
        {/* Skip link: visible only on keyboard focus. Saves tabbing past the
            nav cluster on every page load. */}
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="regmark" style={{ top: 8, left: 8 }} />
        <div className="regmark" style={{ top: 8, right: 8 }} />
        <div className="regmark" style={{ bottom: 8, left: 8 }} />
        <div className="regmark" style={{ bottom: 8, right: 8 }} />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
