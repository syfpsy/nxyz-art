/**
 * Derive a still-image thumbnail URL from a Gumlet HLS manifest URL.
 *
 * Gumlet hosts generated posters at:
 *   https://video.gumlet.io/{collection}/{video}/thumbnail-{idx}-{t}.png
 *
 * The first still (`thumbnail-1-0.png`) is produced for every video and
 * is safe to use as a poster frame without any API call.
 *
 * Returns `null` when the input URL isn't a recognisable Gumlet manifest,
 * so callers can fall back to a generic placeholder instead of requesting
 * a URL that will 404.
 */
export function gumletThumbnail(src: string | undefined | null): string | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith("gumlet.io")) return null;
    // Expect: /{collection}/{video}/main.m3u8  (possibly with query)
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 3) return null;
    const [collection, video] = parts;
    return `https://video.gumlet.io/${collection}/${video}/thumbnail-1-0.png`;
  } catch {
    return null;
  }
}
