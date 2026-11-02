"use client";

import { switchLocale } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = { locale: Locale; label: string; overHero?: boolean };

/** Pilihan bahasa manual: disimpan di cookie dan selalu mengalahkan deteksi otomatis (lib/i18n). */
export function LanguageSwitcher({ locale, label, overHero }: Props) {
  const choose = (next: Locale) => {
    if (next !== locale) switchLocale(next);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex rounded-full p-0.5 text-xs font-semibold ring-1 transition-colors",
        overHero ? "ring-white/40" : "ring-neutral-300",
      )}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-pressed={active}
            lang={option}
            className={cn(
              "min-w-9 rounded-full px-2.5 py-1.5 uppercase transition-colors",
              active
                ? overHero
                  ? "bg-white text-neutral-950"
                  : "bg-neutral-950 text-white"
                : overHero
                  ? "text-white/85 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-950",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
