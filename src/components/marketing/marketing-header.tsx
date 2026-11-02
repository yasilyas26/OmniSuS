"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

const SCROLL_THRESHOLD = 8;
// Warna latar hero; dipakai sebagai "lubang" pada logo saat header transparan di atas hero.
const HERO_BLUE = "oklch(0.56 0.12 250)";
// Beranda dapat diakses lewat "/" (dirutekan ulang proxy) atau langsung "/id" dan "/en".
const HOME_PATHS = new Set(["/", ...LOCALES.map((locale) => `/${locale}`)]);

type Props = { m: Messages["nav"]; locale: Locale };

/**
 * Transparan di posisi paling atas, menjadi pil putih saat halaman digulir.
 * Di beranda teksnya putih (di atas hero biru); di halaman putih teksnya gelap.
 * Tombol Get started hanya tampil mulai ukuran tablet; di ponsel header cukup logo, bahasa, dan menu.
 * Menu mobile memakai <details> agar tanpa JavaScript tambahan.
 */
export function MarketingHeader({ m, locale }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = HOME_PATHS.has(pathname) && !scrolled;
  const navItems = [
    { href: "/", label: m.home },
    { href: "/#about", label: m.about },
    { href: "/#core-features", label: m.features },
    { href: "/#privasi", label: m.privacy },
  ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div
        style={{ "--background": overHero ? HERO_BLUE : "white" } as React.CSSProperties}
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full px-3 py-2 transition-all duration-300",
          scrolled
            ? "bg-white text-neutral-900 shadow-md ring-1 ring-black/5"
            : overHero
              ? "bg-transparent text-white"
              : "bg-transparent text-neutral-900",
        )}
      >
        <Logo inverse={overHero} />
        <nav
          aria-label={m.siteMenu}
          className={cn(
            "hidden items-center gap-8 text-sm transition-colors md:flex",
            overHero ? "text-white/85" : "text-neutral-600",
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={overHero ? "hover:text-white" : "hover:text-neutral-950"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={m.language} overHero={overHero} />
          <Link
            href="/daftar"
            className={cn(
              "hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors md:inline-flex",
              overHero
                ? "bg-white text-neutral-950 hover:bg-white/90"
                : "bg-neutral-950 text-white hover:bg-neutral-800",
            )}
          >
            {m.getStarted}
          </Link>
          <details className="relative md:hidden">
            <summary
              aria-label={m.openMenu}
              className={cn(
                "flex size-10 cursor-pointer list-none items-center justify-center rounded-full",
                overHero ? "hover:bg-white/10" : "hover:bg-neutral-100",
              )}
            >
              <Menu className="size-5" aria-hidden />
            </summary>
            <nav
              aria-label={m.mobileMenu}
              className="absolute right-0 top-12 w-52 space-y-1 rounded-2xl bg-white p-2 text-neutral-900 shadow-lg ring-1 ring-black/5"
            >
              {[...navItems, { href: "/masuk", label: m.signIn }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-neutral-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
