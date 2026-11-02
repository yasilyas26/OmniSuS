"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/i18n/config";

/**
 * Root layout dipakai bersama seluruh aplikasi sehingga `<html lang>` tidak bisa bergantung pada bahasa
 * halaman publik; atributnya diselaraskan di sini setelah hidrasi (untuk pembaca layar dan terjemahan otomatis).
 */
export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);
  return null;
}
