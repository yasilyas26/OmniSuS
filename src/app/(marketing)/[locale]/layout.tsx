import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/marketing/html-lang";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { siteContentService } from "@/features/site-content";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

// Halaman publik dibuat statis per bahasa; proxy.ts memilih /id atau /en untuk URL tanpa awalan.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function MarketingLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [content, m] = [await siteContentService.get(locale), getMessages(locale)];

  return (
    <div className="relative flex flex-1 flex-col">
      <HtmlLang locale={locale} />
      <MarketingHeader m={m.nav} locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter content={content.footer} m={m} />
    </div>
  );
}
