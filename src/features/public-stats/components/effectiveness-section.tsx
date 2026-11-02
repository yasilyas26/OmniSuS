import { EmphasisText } from "@/components/marketing/emphasis-text";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { SiteContent } from "@/features/site-content";
import type { Messages } from "@/lib/i18n/messages";

import type { LandingStats } from "../types";
import { CategoryBar } from "./category-bar";
import { DimensionBars } from "./dimension-bars";
import { ProfileStats } from "./profile-stats";

function KeyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl bg-muted/60 p-8 text-center">
      <p className="font-display text-6xl leading-none">{value}</p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type Props = { stats: LandingStats; content: SiteContent["effectiveness"]; m: Messages };

/**
 * "Seberapa efektif": hanya angka agregat nyata dari periode tertutup, bukan klaim karangan (PRD §8).
 * Teks judul dan catatan bisa diedit admin; angkanya tidak. Data seed demo wajib berlabel.
 */
export function EffectivenessSection({ stats, content, m }: Props) {
  const hasData = stats.businessCount > 0;

  return (
    <section id="effectiveness" className="scroll-mt-24 bg-muted/30 px-4 py-24">
      <div className="mx-auto max-w-6xl space-y-14">
        <div className="space-y-4">
          <SectionHeading
            eyebrow={m.sections.effectiveness}
            title={<EmphasisText text={content.title} />}
            description={content.description}
          />
        </div>

        {hasData ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KeyStat value={String(stats.businessCount)} label={m.stats.businesses} />
              <KeyStat value={String(stats.respondentCount)} label={m.stats.respondents} />
              <KeyStat value={`${stats.healthyPercent}%`} label={m.stats.healthy} />
              <KeyStat
                value={stats.averageScore === null ? "—" : stats.averageScore.toFixed(1)}
                label={m.stats.averageScore}
              />
            </div>
            <CategoryBar distribution={stats.categoryDistribution} m={m.stats} />
            <DimensionBars dimensions={stats.dimensions} m={m.stats} />
            <ProfileStats profile={stats.profile} bySector={stats.bySector} m={m} />
          </>
        ) : (
          <p className="rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            {m.stats.empty}
          </p>
        )}

        <p className="mx-auto max-w-2xl text-center text-xs text-muted-foreground">
          {content.disclaimer}
        </p>
      </div>
    </section>
  );
}
