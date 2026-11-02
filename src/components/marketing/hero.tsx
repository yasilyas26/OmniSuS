import { Lock } from "lucide-react";
import Link from "next/link";

import { CategoryBadge } from "@/components/category-badge";
import type { SiteContent } from "@/features/site-content";
import type { Messages } from "@/lib/i18n/messages";

import { EmphasisText } from "./emphasis-text";

const BUTTON = "rounded-full px-6 py-3 text-sm font-medium transition-colors";

/** Kartu-kartu di bawah ini ilustrasi tampilan produk, bukan data nyata. */
function PreviewCards({ m }: { m: Messages["hero"] }) {
  return (
    <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left text-neutral-900 md:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-xl md:-rotate-2">
        <p className="text-sm text-neutral-500">{m.overallScore}</p>
        <p className="mt-2 flex items-center gap-3">
          <span className="font-display text-6xl leading-none">72.4</span>
          <CategoryBadge category="FAIR" label={m.category} />
        </p>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-xl md:translate-y-4">
        <p className="text-sm text-neutral-500">{m.gapTitle}</p>
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0">{m.owner}</span>
            <span className="h-2.5 w-[82%] rounded-full bg-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0">{m.employee}</span>
            <span className="h-2.5 w-[58%] rounded-full bg-orange-500" />
          </div>
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-xl md:rotate-2">
        <Lock className="size-6" aria-hidden />
        <p className="mt-3 text-sm font-medium">{m.anonymousTitle}</p>
        <p className="mt-1 text-xs text-neutral-500">{m.anonymousText}</p>
      </div>
    </div>
  );
}

export function Hero({ content, m }: { content: SiteContent["hero"]; m: Messages["hero"] }) {
  return (
    <section
      id="home"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-linear-to-b from-[oklch(0.56_0.12_250)] to-[oklch(0.76_0.08_240)] px-4 pb-16 pt-32 text-center text-white"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-display text-5xl leading-[1.05] sm:text-7xl">
          <EmphasisText text={content.title} />
        </h1>
        <p className="mx-auto max-w-xl text-lg text-white/85">{content.description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/daftar"
            className={`${BUTTON} bg-neutral-950 text-white hover:bg-neutral-800`}
          >
            {content.primaryCta}
          </Link>
          <Link href="/#about" className={`${BUTTON} bg-white text-neutral-950 hover:bg-white/90`}>
            {content.secondaryCta}
          </Link>
        </div>
      </div>
      <PreviewCards m={m} />
    </section>
  );
}
