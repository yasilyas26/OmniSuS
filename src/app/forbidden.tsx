import Link from "next/link";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <StatusPage
      fullScreen
      code="403"
      title="Akses ditolak"
      description="Akunmu tidak punya izin untuk membuka halaman ini."
      actions={
        <Button asChild>
          <Link href="/dashboard">Ke dashboard</Link>
        </Button>
      }
    />
  );
}
