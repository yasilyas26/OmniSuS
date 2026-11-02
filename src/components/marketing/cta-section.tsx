import Link from "next/link";

import type { SiteContent } from "@/features/site-content";

import { EmphasisText } from "./emphasis-text";

export function CtaSection({ content }: { content: SiteContent["cta"] }) {
  return (
    <section id="get-started" className="scroll-mt-24 px-2 pb-24 sm:px-3">
      <div className="w-full rounded-[2rem] bg-linear-to-b from-[oklch(0.56_0.12_250)] to-[oklch(0.72_0.09_240)] px-6 py-20 text-center text-white">
        <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
          <EmphasisText text={content.title} />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85">{content.description}</p>
        <Link
          href="/daftar"
          className="mt-8 inline-flex rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {content.button}
        </Link>
      </div>
    </section>
  );
}
