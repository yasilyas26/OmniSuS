import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS, type Locale } from "./config";

/** Menyimpan pilihan bahasa pengguna (cookie), lalu memuat ulang agar proxy memilih halaman bahasa baru. */
export function switchLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  window.location.reload();
}
