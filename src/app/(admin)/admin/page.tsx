import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { instrumentsService } from "@/features/instruments";
import { SECTION_DEFS, siteContentService } from "@/features/site-content";
import { LOCALES } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function AdminHomePage() {
  const [instruments, customizedByLocale] = await Promise.all([
    instrumentsService.list(),
    Promise.all(
      LOCALES.map(
        async (locale) => [locale, await siteContentService.getCustomizedKeys(locale)] as const,
      ),
    ),
  ]);
  const active = instruments.filter((item) => item.isActive);
  const drafts = instruments.filter((item) => !item.isActive && item.responseCount === 0);

  return (
    <>
      <PageHeader
        title="Ringkasan admin"
        description="Kelola instrumen kuesioner dan konten landing page."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Instrumen aktif</CardTitle>
            <CardDescription>Versi yang dipakai pengisian baru.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-1">
              {active.map((item) => (
                <li key={item.id}>
                  <strong>{item.code}</strong> · {item.questionCount} butir
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">{drafts.length} draf menunggu.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/instrumen">Kelola instrumen</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konten landing</CardTitle>
            <CardDescription>Bagian yang sudah diubah dari teks bawaan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-1">
              {customizedByLocale.map(([locale, keys]) => (
                <li key={locale}>
                  <strong className="uppercase">{locale}</strong>: {keys.size} dari{" "}
                  {SECTION_DEFS.length} bagian
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/landing">Edit landing</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faktor</CardTitle>
            <CardDescription>Nama dan deskripsi tiap faktor, dalam dua bahasa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/faktor">Edit faktor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
