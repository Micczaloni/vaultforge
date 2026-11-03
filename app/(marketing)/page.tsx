import Link from "next/link";
import { connection } from "next/server";

import { CoverMarquee } from "@/components/marketing/cover-marquee";
import {
  CinematicHero,
  type FloatProp,
} from "@/components/marketing/cinematic-hero";
import {
  FeaturedCarousel,
  type FeaturedSlide,
} from "@/components/marketing/featured-carousel";
import { TiltSpotlight } from "@/components/marketing/tilt-spotlight";
import { Button } from "@/components/ui/button";
import {
  demoCoverUrl,
  steamAppIdFromCoverUrl,
  steamLibraryHero,
} from "@/lib/games/covers";
import { prisma } from "@/lib/db/prisma";

export const instant = false;

const HERO = {
  slug: "baldurs-gate-3",
  title: "Baldur's Gate 3",
  backdrop: "/hero/bg3-hero.jpg",
  dragon: "/hero/dragon-fg.png",
  logo: "/hero/bg3-logo.png",
};

export default async function LandingPage() {
  await connection();

  let games: Array<{
    slug: string;
    title: string;
    coverUrl: string | null;
    rating: number | null;
    genres: { genre: { name: string } }[];
  }> = [];

  try {
    games = await prisma.game.findMany({
      orderBy: { rating: "desc" },
      take: 24,
      select: {
        slug: true,
        title: true,
        coverUrl: true,
        rating: true,
        genres: { select: { genre: { select: { name: true } } } },
      },
    });
  } catch {
    games = [];
  }

  const heroGame = games.find((g) => g.slug === HERO.slug);

  const slides: FeaturedSlide[] = games.slice(0, 8).map((g) => {
    const appId = steamAppIdFromCoverUrl(g.coverUrl);
    const coverSrc = g.coverUrl || demoCoverUrl(g.slug);
    return {
      slug: g.slug,
      title: g.title,
      coverSrc,
      wideSrc: appId ? steamLibraryHero(appId) : coverSrc,
      rating: g.rating,
      genres: g.genres.map((x) => x.genre.name),
    };
  });

  const floatProps: FloatProp[] = games.slice(0, 4).map((g, i) => ({
    src: g.coverUrl || demoCoverUrl(g.slug),
    alt: g.title,
    depth: [0.25, 0.55, 0.4, 0.75][i] ?? 0.5,
    rotate: [-8, 6, -4, 10][i] ?? 0,
    className: "",
  }));

  const spotlightSrc = slides[0]?.wideSrc ?? steamLibraryHero(1086940);

  const marqueeA = games.slice(0, 12).map((g) => ({
    slug: g.slug,
    title: g.title,
    coverSrc: g.coverUrl || demoCoverUrl(g.slug),
  }));
  const marqueeB = games.slice(12, 24).map((g) => ({
    slug: g.slug,
    title: g.title,
    coverSrc: g.coverUrl || demoCoverUrl(g.slug),
  }));

  return (
    <div className="relative">
      <CinematicHero
        backdropSrc={HERO.backdrop}
        dragonSrc={HERO.dragon}
        floatProps={floatProps}
        logoSrc={HERO.logo}
        gameTitle={heroGame?.title ?? HERO.title}
        gameHref={`/games/${HERO.slug}`}
        rating={heroGame?.rating ?? null}
      />

      {/* Ink-style tilted spotlight — one job, one panel */}
      <section className="relative px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <TiltSpotlight
            href="/games"
            imageSrc={spotlightSrc}
            eyebrow="Discover"
            title="Defining your next play session"
            body="Browse a curated vault of store-quality titles — filter, track, and forge your record."
            cta="Explore the catalog"
          />
        </div>
      </section>

      {/* Featured carousel */}
      <section className="relative py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(ellipse_at_90%_30%,rgba(251,146,60,0.12),transparent_40%)]"
        />
        <div className="relative mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase">
                Featured
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Hot in the vault
              </h2>
            </div>
            <Button
              variant="ghost"
              className="text-cyan-200 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/games">View all →</Link>
            </Button>
          </div>

          {slides.length > 0 ? (
            <FeaturedCarousel slides={slides} />
          ) : (
            <p className="text-white/70">
              Seed the database to populate featured titles.
            </p>
          )}
        </div>
      </section>

      {marqueeA.length > 0 ? (
        <section className="relative space-y-3 py-10">
          <div className="mx-auto mb-6 max-w-6xl px-4 sm:px-6">
            <p className="font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">
              The catalog
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {games.length}+ titles ready to track
            </h2>
          </div>
          <CoverMarquee items={marqueeA} />
          {marqueeB.length > 0 ? (
            <CoverMarquee items={marqueeB} reverse />
          ) : null}
        </section>
      ) : null}

      <section className="relative py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Discover",
              body: "Browse a curated catalog with real store art, filters, and search.",
              tone: "from-cyan-400/25 to-sky-500/5",
            },
            {
              step: "02",
              title: "Track",
              body: "Wishlist, backlog, playing, completed — your record, your pace.",
              tone: "from-fuchsia-400/25 to-pink-500/5",
            },
            {
              step: "03",
              title: "Forge",
              body: "Unlock achievements, earn XP, and climb the public leaderboard.",
              tone: "from-orange-400/25 to-amber-500/5",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1`}
            >
              <p className="font-mono text-xs tracking-[0.25em] text-white/50">
                {item.step}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white">
                Try it with a demo account
              </p>
              <p className="mt-1 font-mono text-xs text-white/75 sm:text-sm">
                admin@vaultforge.dev · Password123! &nbsp;·&nbsp;
                aria@vaultforge.dev · Password123!
              </p>
            </div>
            <Button
              className="bg-white text-slate-900 hover:bg-cyan-100"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
