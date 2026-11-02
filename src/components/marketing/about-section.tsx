import type { SiteContent } from "@/features/site-content";

import { EmphasisText } from "./emphasis-text";
import { SectionHeading } from "./section-heading";

export function AboutSection({
  content,
  eyebrow,
}: {
  content: SiteContent["about"];
  eyebrow: string;
}) {
  return (
    <section id="about" className="scroll-mt-24 px-4 py-24">
      <div className="mx-auto max-w-6xl space-y-14">
        <SectionHeading
          eyebrow={eyebrow}
          title={<EmphasisText text={content.title} />}
          description={content.description}
        />
        <dl className="grid gap-4 sm:grid-cols-3">
          {content.facts.map((fact) => (
            <div key={fact.label} className="rounded-3xl bg-muted/60 p-8 text-center">
              <dt className="font-display text-6xl leading-none">{fact.value}</dt>
              <dd className="mt-3 text-sm text-muted-foreground">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
