import Image from "next/image";

type PersonAvatarProps = {
  name: string;
  photoSrc: string | null;
  /** Optional size hint for next/image `sizes`. */
  sizes?: string;
};

/**
 * Portrait or typographic initials — matches the studio’s editorial tone
 * without requiring a photo on day one.
 */
export function PersonAvatar({
  name,
  photoSrc,
  sizes = "(max-width: 720px) 88vw, 360px",
}: PersonAvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 5",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--bg-sunken)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {photoSrc ? (
        <Image
          src={photoSrc}
          alt={`Portrait of ${name}`}
          fill
          sizes={sizes}
          style={{ objectFit: "cover" }}
          priority={false}
        />
      ) : (
        <div
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(28px, 7vw, 48px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "var(--fg-tertiary)",
          }}
        >
          {initials || "?"}
        </div>
      )}
    </div>
  );
}
