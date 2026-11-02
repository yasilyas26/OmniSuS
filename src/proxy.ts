import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE, LOCALIZED_PATHS } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/resolve";

const LOCALIZED = new Set<string>(LOCALIZED_PATHS);

/** Header negara dari CDN/host; tidak ada saat dev lokal (lalu hanya bahasa perangkat yang dipakai). */
const countryOf = (request: NextRequest) =>
  request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");

/**
 * 1. Halaman publik: pilih bahasa lalu rewrite internal ke /id atau /en (URL pengunjung tetap sama),
 *    sehingga tiap bahasa tetap berupa halaman statis.
 * 2. Halaman di balik login: redirect cepat berbasis cookie. Otorisasi sebenarnya ada di guards server (SECURITY §3).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (LOCALIZED.has(pathname)) {
    const locale = resolveLocale({
      cookie: request.cookies.get(LOCALE_COOKIE)?.value,
      country: countryOf(request),
      acceptLanguage: request.headers.get("accept-language"),
    });
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const response = NextResponse.rewrite(url);
    // Isi berbeda menurut cookie/bahasa; cegah cache bersama menyajikan bahasa yang salah.
    response.headers.append("Vary", "Cookie, Accept-Language");
    return response;
  }

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/metodologi",
    "/privasi",
    "/dashboard/:path*",
    "/umkm/:path*",
    "/karyawan/:path*",
    "/penilaian/:path*",
    "/admin/:path*",
  ],
};
