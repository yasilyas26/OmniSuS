export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie pilihan bahasa dari pengguna; selalu mengalahkan deteksi otomatis. */
export const LOCALE_COOKIE = "omnisus-locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Halaman publik yang tersedia dalam dua bahasa (dirutekan ulang oleh proxy). */
export const LOCALIZED_PATHS = ["/", "/metodologi", "/privasi"] as const;
