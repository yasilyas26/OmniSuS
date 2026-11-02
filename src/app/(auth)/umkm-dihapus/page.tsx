import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth";
import { DELETION_GRACE_DAYS } from "@/lib/retention";
import { requireSession } from "@/server/guards";

export const metadata: Metadata = { title: "UMKM dihapus", robots: { index: false } };

export default async function BusinessDeletedPage() {
  await requireSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>UMKM ini sudah dihapus</CardTitle>
        <CardDescription>
          Akses ke data usaha ditutup. Data masih tersimpan {DELETION_GRACE_DAYS} hari sejak
          dihapus; hubungi admin OmniSUS bila ingin memulihkannya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}
