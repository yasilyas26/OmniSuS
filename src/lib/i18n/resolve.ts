import { DEFAULT_LOCALE, type Locale, isLocale } from "./config";

type ResolveInput = {
  /** Nilai cookie pilihan bahasa pengguna, jika ada. */
  cookie?: string | null;
  /** Kode negara dari CDN/host (mis. `x-vercel-ip-country`); undefined bila tidak diketahui. */
  country?: string | null;
  /** Header `Accept-Language` dari peramban. */
  acceptLanguage?: string | null;
};

/** Mengurutkan tag bahasa dari `Accept-Language` berdasarkan nilai q (tertinggi dulu). */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((item) => item.tag && item.tag !== "*" && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map((item) => item.tag);
}

// "in" adalah kode lama untuk bahasa Indonesia yang masih dikirim sebagian perangkat.
const isIndonesianTag = (tag: string) =>
  tag === "id" || tag.startsWith("id-") || tag === "in" || tag.startsWith("in-");

/**
 * Menentukan bahasa tampilan:
 * 1. Pilihan manual pengguna (cookie) selalu menang.
 * 2. Indonesia hanya jika bahasa utama perangkat Indonesia DAN pengunjung terdeteksi di Indonesia.
 *    - perangkat Inggris, di mana pun → Inggris
 *    - perangkat Indonesia tetapi mengakses dari luar negeri → Inggris
 * 3. Jika negara tidak diketahui (dev lokal / tanpa CDN), keputusan hanya dari bahasa perangkat.
 */
export function resolveLocale({ cookie, country, acceptLanguage }: ResolveInput): Locale {
  if (isLocale(cookie)) return cookie;

  const preferred = parseAcceptLanguage(acceptLanguage)[0];
  if (!preferred || !isIndonesianTag(preferred)) return DEFAULT_LOCALE;

  const knownCountry = country?.trim().toUpperCase();
  if (knownCountry && knownCountry !== "ID") return "en";
  return "id";
}
