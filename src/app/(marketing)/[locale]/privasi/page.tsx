import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmphasisText } from "@/components/marketing/emphasis-text";
import { ProsePage, ProseSection } from "@/components/marketing/prose-page";
import { env } from "@/env";
import { fillTokens } from "@/lib/emphasis";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privasi">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "id" ? "Privasi" : "Privacy" };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privasi">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { privacyPage: t } = getMessages(locale);
  const tokens = { min: env.MIN_EMPLOYEE_RESPONSES };

  return (
    <ProsePage title={<EmphasisText text={t.title} />} intro={t.intro}>
      {t.sections.map((section) => (
        <ProseSection key={section.title} title={section.title}>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{fillTokens(paragraph, tokens)}</p>
          ))}
          {section.bullets ? (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{fillTokens(bullet, tokens)}</li>
              ))}
            </ul>
          ) : null}
        </ProseSection>
      ))}
    </ProsePage>
  );
}
