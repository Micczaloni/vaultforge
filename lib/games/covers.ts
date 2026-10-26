/** Curated dark / gaming atmosphere images for demo covers (Unsplash). */
const DEMO_COVERS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4ea965a?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1580327344181-c9597727ffe7?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=600&h=800&q=80",
  "https://images.unsplash.com/photo-1579373903781-fd5ce0fcf4c8?auto=format&fit=crop&w=600&h=800&q=80",
] as const;

export function demoCoverUrl(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % DEMO_COVERS.length;
  }
  return DEMO_COVERS[hash] ?? DEMO_COVERS[0];
}
