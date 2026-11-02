import type { SiteContent } from "@/features/site-content";

import { EmphasisText } from "./emphasis-text";
import { FeatureCards } from "./feature-cards";
import { SectionHeading } from "./section-heading";

export function CoreFeaturesSection({
  content,
  eyebrow,
}: {
  content: SiteContent["coreFeatures"];
  eyebrow: string;
}) {
  return (
    <section id="core-features" className="scroll-mt-24 px-4 py-24">
      <div className="mx-auto max-w-6xl space-y-14">
        <SectionHeading eyebrow={eyebrow} title={<EmphasisText text={content.title} />} />
        <FeatureCards items={content.items} />
      </div>
    </section>
  );
}
