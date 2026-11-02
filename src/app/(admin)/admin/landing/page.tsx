import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_DEFS, SectionForm, siteContentService } from "@/features/site-content";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Konten landing" };

const LOCALE_NAMES = { id: "Indonesia", en: "English" } as const;

export default async function LandingEditorPage({ searchParams }: PageProps<"/admin/landing">) {
  const { lang } = await searchParams;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  const [content, customized] = await Promise.all([
    siteContentService.get(locale),
    siteContentService.getCustomizedKeys(locale),
  ]);

  return (
    <>
      <PageHeader
        title="Konten landing page"
        description="Ubah teks per bagian dan per bahasa. Perubahan langsung tampil di situs publik."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              Lihat situs
            </Link>
          </Button>
        }
      />

      <nav aria-label="Pilih bahasa konten" className="mb-6 flex gap-2">
        {LOCALES.map((option) => (
          <Button
            key={option}
            asChild
            size="sm"
            variant={option === locale ? "default" : "outline"}
          >
            <Link
              href={`/admin/landing?lang=${option}`}
              aria-current={option === locale ? "page" : undefined}
            >
              {LOCALE_NAMES[option]}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="space-y-4">
        {SECTION_DEFS.map((def, index) => (
          <Card key={def.key}>
            <details open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-6 py-1">
                <span>
                  <span className="font-medium">{def.title}</span>
                  <span className="block text-sm text-muted-foreground">{def.hint}</span>
                </span>
                <Badge variant={customized.has(def.key) ? "default" : "outline"}>
                  {customized.has(def.key) ? "Diubah" : "Bawaan"}
                </Badge>
              </summary>
              <CardContent className="pt-4">
                <SectionForm
                  // Dipasang ulang saat data server berubah (setelah simpan/reset) agar formulir ikut segar.
                  key={`${locale}-${def.key}-${JSON.stringify(content[def.key])}`}
                  def={def}
                  locale={locale}
                  initial={content[def.key]}
                  customized={customized.has(def.key)}
                />
              </CardContent>
            </details>
          </Card>
        ))}
      </div>
    </>
  );
}
