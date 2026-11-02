import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmphasisText } from "@/components/marketing/emphasis-text";
import { ProsePage, ProseSection } from "@/components/marketing/prose-page";
import { FAIR_MIN_SCORE, HEALTHY_MIN_SCORE, NOTABLE_GAP } from "@/domain/scoring";
import { env } from "@/env";
import { publicStatsService } from "@/features/public-stats";
import { fillTokens } from "@/lib/emphasis";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/metodologi">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "id" ? "Metodologi" : "Methodology" };
}

export default async function MethodologyPage({ params }: PageProps<"/[locale]/metodologi">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { dimensions } = await publicStatsService.getLandingStats(locale);
  const { methodology: t } = getMessages(locale);

  const ownerWeight = Math.round(env.OWNER_WEIGHT * 100);
  const tokens = {
    ownerWeight,
    employeeWeight: 100 - ownerWeight,
    healthy: HEALTHY_MIN_SCORE,
    fair: FAIR_MIN_SCORE,
    gap: NOTABLE_GAP,
    min: env.MIN_EMPLOYEE_RESPONSES,
  };

  return (
    <ProsePage title={<EmphasisText text={t.title} />} intro={t.intro}>
      <ProseSection title={t.factorsTitle}>
        <ul>
          {dimensions.map((dimension) => (
            <li key={dimension.key}>
              <strong>{dimension.name}</strong> ({dimension.isShared ? t.shared : t.ownerOnly}):{" "}
              {dimension.description}
            </li>
          ))}
        </ul>
      </ProseSection>

      <ProseSection title={t.scaleTitle}>
        {t.scale.map((paragraph) => (
          <p key={paragraph}>{fillTokens(paragraph, tokens)}</p>
        ))}
      </ProseSection>

      <ProseSection title={t.categoriesTitle}>
        <ul>
          {t.categories.map((category) => (
            <li key={category.label}>
              <strong>{category.label}</strong>: {fillTokens(category.text, tokens)}
            </li>
          ))}
        </ul>
        <p>{t.provisional}</p>
      </ProseSection>

      <ProseSection title={t.gapTitle}>
        <p>{fillTokens(t.gap, tokens)}</p>
      </ProseSection>

      <ProseSection title={t.limitsTitle}>
        <ul>
          {t.limits.map((limit) => (
            <li key={limit}>{fillTokens(limit, tokens)}</li>
          ))}
        </ul>
      </ProseSection>
    </ProsePage>
  );
}
