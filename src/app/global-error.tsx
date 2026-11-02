"use client";

import "./globals.css";

/** Galat di root layout. Mengganti layout, jadi harus punya <html> dan <body> sendiri. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <p className="text-8xl leading-none font-light text-primary">500</p>
        <h1 className="text-2xl font-medium tracking-tight">Ada yang tidak beres</h1>
        <p className="max-w-md text-muted-foreground">
          Aplikasi gagal dimuat. Coba lagi sebentar; jika masih terjadi, muat ulang halaman.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Coba lagi
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- root layout rusak, navigasi penuh */}
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium">
            Ke beranda
          </a>
        </div>
      </body>
    </html>
  );
}
