import type { SiteContent } from "@/features/site-content";

import { EmphasisText } from "./emphasis-text";
import { FeatureCards } from "./feature-cards";
import { SectionHeading } from "./section-heading";

export function BenefitSection({
  content,
  eyebrow,
}: {
  content: SiteContent["benefits"];
  eyebrow: string;
}) {
  return (
    <section id="benefit" className="scroll-mt-24 px-4 py-24">
      <div className="mx-auto max-w-6xl space-y-14">
        <SectionHeading eyebrow={eyebrow} title={<EmphasisText text={content.title} />} />
        <FeatureCards items={content.items} />
      </div>
    </section>
  );
}
