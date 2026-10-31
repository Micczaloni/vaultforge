import Image from "next/image";

/**
 * Soft, colourful key-art wash behind sub-page headers so every route shares
 * the landing's "game store" atmosphere without stealing focus from content.
 */
export function PageBackdrop({
  src = "/hero/bg3-hero.jpg",
  height = "h-[360px]",
}: {
  src?: string;
  height?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${height}`}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        className="scale-110 object-cover opacity-45 blur-2xl"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,48,0.25)_0%,rgba(11,20,48,0.75)_55%,#0b1430_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(34,211,238,0.25),transparent_45%),radial-gradient(ellipse_at_90%_10%,rgba(251,146,60,0.18),transparent_40%)]" />
    </div>
  );
}
