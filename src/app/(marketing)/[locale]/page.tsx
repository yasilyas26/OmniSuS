import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutSection } from "@/components/marketing/about-section";
import { BenefitSection } from "@/components/marketing/benefit-section";
import { CoreFeaturesSection } from "@/components/marketing/core-features-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Hero } from "@/components/marketing/hero";
import { PartnerLogos } from "@/components/marketing/partner-logos";
import { PrivacySection } from "@/components/marketing/privacy-section";
import { Reveal } from "@/components/marketing/reveal";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { EffectivenessSection, publicStatsService } from "@/features/public-stats";
import { siteContentService } from "@/features/site-content";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const TITLES = {
  id: "OmniSUS · Seberapa sehat UMKM-mu dari dalam?",
  en: "OmniSUS · How healthy is your business from the inside?",
} as const;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return { title: { absolute: isLocale(locale) ? TITLES[locale] : TITLES.en } };
}

// ISR (ADR-006): dibuat ulang tiap jam, dan segera saat periode ditutup atau admin menyimpan konten.
export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [stats, content] = await Promise.all([
    publicStatsService.getLandingStats(locale),
    siteContentService.get(locale),
  ]);
  const m = getMessages(locale);

  return (
    <>
      <Hero content={content.hero} m={m.hero} />
      <PartnerLogos content={content.partners} label={m.sections.partnersLabel} />
      <Reveal>
        <AboutSection content={content.about} eyebrow={m.sections.about} />
      </Reveal>
      <Reveal>
        <EffectivenessSection stats={stats} content={content.effectiveness} m={m} />
      </Reveal>
      <Reveal>
        <CoreFeaturesSection content={content.coreFeatures} eyebrow={m.sections.features} />
      </Reveal>
      <Reveal>
        <BenefitSection content={content.benefits} eyebrow={m.sections.benefit} />
      </Reveal>
      <Reveal>
        <PrivacySection content={content.privacy} eyebrow={m.sections.privacy} />
      </Reveal>
      <Reveal>
        <TestimonialSection content={content.testimonials} eyebrow={m.sections.testimonials} />
      </Reveal>
      <Reveal>
        <CtaSection content={content.cta} />
      </Reveal>
    </>
  );
}
