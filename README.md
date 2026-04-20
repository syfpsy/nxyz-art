# nxyz.art — volume I

The studio site for **nxyz**. Editorial tone, one accent, typography does the work.

Built from the design system at `../nxyz-studio-design-system/` so the brand brief
and the real site stay aligned.

---

## Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict)
- **Styling**: CSS tokens + semantic classes (no Tailwind). Tokens live in `styles/tokens.css`.
- **Fonts**: `next/font/google` — Space Grotesk (display + body), JetBrains Mono (labels)
- **Icons**: none on this pass. If introduced later, use Lucide at 1.5px stroke per the brief.
- **Deploy target**: Vercel

No external runtime dependencies beyond React / Next.

---

## Run locally

```bash
cd site
npm install
npm run dev
```

Then open http://localhost:3000. The site is sticky-nav + scroll; try `⌘K` (or `Ctrl+K`) to open the command bar and jump anywhere.

### Other commands

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # next lint
npm run typecheck    # tsc --noEmit
```

---

## Project layout

```
site/
├─ app/                          Next.js App Router
│  ├─ layout.tsx                 Root shell: fonts, theme script, nav, footer
│  ├─ page.tsx                   Home / masthead index
│  ├─ globals.css                Imports tokens + base + type classes
│  ├─ not-found.tsx              404 page
│  ├─ sitemap.ts                 /sitemap.xml
│  ├─ robots.ts                  /robots.txt
│  ├─ work/                      Work archive + per-work case studies
│  │  ├─ page.tsx
│  │  └─ [slug]/page.tsx
│  ├─ lab/                       Experiments index + entries
│  ├─ writing/                   Journal index + entries
│  └─ colophon/                  About-the-studio page
├─ components/
│  ├─ nav.tsx                    Sticky masthead nav (wordmark + ⌘K + status)
│  ├─ command-bar.tsx            ⌘K overlay, keyboard nav
│  ├─ footer.tsx                 Colophon strip with grain
│  ├─ masthead.tsx               Home hero: oversized wordmark + filmstrip
│  ├─ catalog.tsx                Index-card work list
│  ├─ periodic-table.tsx         "Disciplines" periodic-table block
│  ├─ experiments-preview.tsx    Lab promo grid on home
│  ├─ correspondence.tsx         Inverse "write to us" section
│  ├─ section-header.tsx         INDEX · 0N typographic header
│  ├─ frame-glyph.tsx            Per-work placeholder SVG art
│  ├─ wordmark.tsx               Typographic nxyz / nxyz studio
│  ├─ studio-clock.tsx           Live UTC + coordinates
│  ├─ theme-toggle.tsx           Dark-mode toggle + inline ThemeScript
│  ├─ grain.tsx                  SVG noise overlay (inverse only)
│  ├─ dot.tsx, mono.tsx          Tiny primitives
├─ content/
│  ├─ works.ts                   8 placeholder projects
│  ├─ experiments.ts             6 lab entries
│  ├─ writing.ts                 4 journal notes
│  └─ studio.ts                  Studio facts (name, location, status, links)
├─ lib/
│  ├─ fonts.ts                   next/font wiring
│  └─ command-index.ts           ⌘K index builder
├─ public/
│  ├─ favicon.svg
│  ├─ logo-nxyz-mark.svg
│  ├─ logo-nxyz-studio.svg
│  └─ logo-nxyz-studio-inverse.svg
├─ styles/
│  └─ tokens.css                 Ported from the design system
└─ ...config files
```

---

## Content — how to swap in real work

All content lives as typed arrays under `content/`. Nothing is hard-coded into page
components. To replace the scaffold:

- **Works**: edit `content/works.ts` — one object per project. `slug` drives the URL,
  `body` is the long-form case study (optional). Case studies currently reuse the
  `FrameGlyph` placeholder art. Drop real imagery by replacing `FrameGlyph` usage on
  the case-study page with `<img>` / `next/image` and keeping the surrounding
  protection gradient.
- **Experiments**: `content/experiments.ts` — `status` controls the accent dot.
- **Writing**: `content/writing.ts` — long-form `body` renders into the `.prose`
  class (see `app/globals.css`). To support full Markdown/MDX, install `@next/mdx`
  and point the `[slug]/page.tsx` at a `.mdx` file instead of the `body` string.
- **Studio facts**: `content/studio.ts` — drives the nav status dot, clock,
  correspondence card, footer, and colophon page.

The `⌘K` command bar reads straight from these — no manual registration needed.

---

## The design language, codified

Every rule below is enforced by the tokens + components. If you break one, the rest
of the system will look wrong.

- **Warm off-white base** `#F7F7F4`. White only for elevated surfaces. Text is
  `#111214`, never pure black.
- **One accent**: `#6D5EF7`. Appears in the favicon dot, the wordmark dot, focus
  rings, hover-links, the single highlighted work, the live-status dot via
  `--status-live`, and one signature moment per page. Never as decoration.
- **Typography first**. Space Grotesk at weight 500/600, leading 1.04 at display.
  Headings use `text-wrap: balance`; body uses `text-wrap: pretty`.
- **Mono labels** (`INDEX · 0N`) are the connective tissue between sections. They
  live on `<Mono>` / `.t-label`.
- **Hairline borders** over shadows. Tight radii (8/12/16/20). No pillowy corners.
- **Motion**: 220ms at `cubic-bezier(0.22, 1, 0.36, 1)`. Fades and 2–6px translations
  only. No bounces, no scale > 1.02.
- **Grain** is permitted once per inverse page, at ~3.5% opacity. Used by the footer
  and the correspondence block.
- **No emoji** in brand-facing surfaces. No gradients as decoration (one protection
  gradient is allowed on case-study heroes only).

The full brief — voice, microcopy, glyphs, must-nots — lives in
`../nxyz-studio-design-system/project/README.md`. That file is the ground truth.

---

## Keyboard

- `⌘K` / `Ctrl+K` — open the command bar (open-anywhere)
- `↑ ↓` — move between results
- `↵` — open the focused result
- `Esc` — close

Further keyboard shortcuts (`J/K` paging, `G+H` home) are scaffolded-out — easy to
add by extending the global keydown handler in `components/command-bar.tsx`.

---

## Dark mode

A `ThemeScript` runs before hydration (in `layout.tsx`), reading
`localStorage["nxyz-theme"]` and falling back to `prefers-color-scheme`. The toggle
in the nav flips `data-theme` on `<html>` and persists the choice. All tokens are
already defined for dark (`styles/tokens.css`).

---

## Deploy to Vercel

1. Push this folder to a git repo (GitHub / GitLab / Bitbucket).
2. In Vercel, **New Project** → import the repo.
3. Set the **Root Directory** to `site` if the repo contains the design system at
   the workspace root alongside it. Otherwise accept the defaults.
4. Framework preset: **Next.js** (auto-detected). Build command: `next build`.
   Output directory: leave blank (Vercel handles App Router automatically).
5. Add the `nxyz.art` domain in **Settings → Domains**.

The `metadataBase` in `app/layout.tsx` and the `BASE` constant in `app/sitemap.ts`
are already set to `https://nxyz.art` — update them if the production domain ever
changes.

---

## Open questions / next steps

These are the follow-ups I flagged while building. Drop a note in the chat and we
can work through them.

1. **Real projects**. Swap the 8 placeholders in `content/works.ts` with actual
   work. Each needs at least `slug`, `title`, `year`, `kind`, `role[]`, `summary`,
   ideally `body`. Imagery — motion stills, UI crops, title-sequence frames — can
   replace `FrameGlyph` in the hero plate of each case study.
2. **Type choice**. The site uses Space Grotesk per your pick. If you license a
   face (ABC Diatype, GT America, Söhne), swap it in by editing `lib/fonts.ts`.
3. **Writing long-form**. The current `body` is a single string; for richer
   articles, add `@next/mdx` and read from `.mdx` files.
4. **Analytics**. None included. Vercel Analytics is a near-zero-JS option if you
   want to measure anything beyond build logs.
5. **Contact form**. The correspondence block currently links to a plain
   `mailto:`. A lightweight alternative is a Vercel serverless route posting to
   Resend / Buttondown; add only if email volume justifies it.

---

## Philosophy

This site is editorial, not marketing. Premium here comes from **editing**, not
effects. Most of the work of building it was in deciding what not to include. If
that spirit ever feels compromised, measure it against three rules:

1. Typography carries the brand.
2. One accent, used rarely.
3. Restraint is the shape of ambition.

nxyz studio · nxyz.art · Volume I · 2026
