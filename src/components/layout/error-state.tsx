"use client";

import Link from "next/link";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";

type Props = {
  reset: () => void;
  /** Tujuan tombol kedua, mis. kembali ke dashboard. */
  homeHref?: string;
  homeLabel?: string;
};

/** Pesan galat ramah. Detail teknis sengaja tidak ditampilkan (SECURITY.md §7). */
export function ErrorState({ reset, homeHref = "/", homeLabel = "Ke beranda" }: Props) {
  return (
    <div role="alert">
      <StatusPage
        code="500"
        title="Ada yang tidak beres"
        description="Halaman ini gagal dimuat. Coba lagi sebentar; jika masih terjadi, kembali ke halaman utama."
        actions={
          <>
            <Button onClick={reset}>Coba lagi</Button>
            <Button asChild variant="outline">
              <Link href={homeHref}>{homeLabel}</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
