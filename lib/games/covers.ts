/**
 * Real game art via Steam CDN — no API key, no RAWG login required.
 * Portrait (library) + wide (header) helpers for cards / heroes.
 */
export function steamLibraryCover(appId: number | string) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

export function steamHeaderCover(appId: number | string) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function steamCapsuleCover(appId: number | string) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`;
}

/** Fallback atmospheric art when a title has no Steam AppID (e.g. console exclusives). */
const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=800&q=80",
] as const;

export function demoCoverUrl(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % FALLBACK_COVERS.length;
  }
  return FALLBACK_COVERS[hash] ?? FALLBACK_COVERS[0];
}

export function resolveCoverUrl(opts: {
  coverUrl?: string | null;
  steamAppId?: number | null;
  slug: string;
}) {
  if (opts.coverUrl) {
    return opts.coverUrl;
  }
  if (opts.steamAppId) {
    return steamLibraryCover(opts.steamAppId);
  }
  return demoCoverUrl(opts.slug);
}
