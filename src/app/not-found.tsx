import Link from "next/link";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StatusPage
      fullScreen
      code="404"
      title="Halaman tidak ditemukan"
      description="Halaman yang kamu cari tidak ada, atau kamu tidak punya akses ke sana."
      actions={
        <Button asChild>
          <Link href="/">Ke beranda</Link>
        </Button>
      }
    />
  );
}
