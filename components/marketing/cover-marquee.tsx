import Image from "next/image";
import Link from "next/link";

type MarqueeItem = { slug: string; title: string; coverSrc: string };

/** Infinite CSS marquee of covers — pauses on hover, reverses direction per row. */
export function CoverMarquee({
  items,
  reverse = false,
}: {
  items: MarqueeItem[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`marquee-track flex w-max gap-3 ${reverse ? "marquee-reverse" : ""}`}
      >
        {doubled.map((item, i) => (
          <Link
            key={`${item.slug}-${i}`}
            href={`/games/${item.slug}`}
            aria-hidden={i >= items.length}
            tabIndex={i >= items.length ? -1 : 0}
            className="relative aspect-[3/4] w-[110px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1 hover:ring-cyan-300/60 sm:w-[130px]"
          >
            <Image
              src={item.coverSrc}
              alt={i >= items.length ? "" : item.title}
              fill
              unoptimized
              className="object-cover"
              sizes="130px"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
