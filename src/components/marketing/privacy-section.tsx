import Link from "next/link";

import { env } from "@/env";
import type { SiteContent } from "@/features/site-content";
import { fillTokens } from "@/lib/emphasis";

import { EmphasisText } from "./emphasis-text";
import { ICONS } from "./icons";
import { SectionHeading } from "./section-heading";

export function PrivacySection({
  content,
  eyebrow,
}: {
  content: SiteContent["privacy"];
  eyebrow: string;
}) {
  // Token {min} diisi dari env supaya angka di landing selalu sama dengan aturan yang berlaku.
  const tokens = { min: env.MIN_EMPLOYEE_RESPONSES };

  return (
    <section id="privasi" className="scroll-mt-24 px-2 py-24 sm:px-3">
      <div className="w-full space-y-12 rounded-[2rem] bg-neutral-950 px-6 py-16 text-white sm:px-12">
        <SectionHeading
          tone="inverse"
          eyebrow={eyebrow}
          title={<EmphasisText text={content.title} />}
          description={content.description}
        />
        <ul className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
          {content.points.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <li key={point.title} className="rounded-3xl bg-white/10 p-6">
                <Icon className="size-6" aria-hidden />
                <h3 className="mt-4 font-medium">{fillTokens(point.title, tokens)}</h3>
                <p className="mt-1 text-sm text-white/75">{fillTokens(point.text, tokens)}</p>
              </li>
            );
          })}
        </ul>
        <div className="text-center">
          <Link
            href="/privasi"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 hover:bg-white/90"
          >
            {content.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
