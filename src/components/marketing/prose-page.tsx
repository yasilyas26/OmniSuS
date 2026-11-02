import type { ReactNode } from "react";

import { Em } from "./section-heading";

type Props = { title: ReactNode; intro: string; children: ReactNode };

/** Kerangka halaman teks panjang (metodologi, privasi). Memberi ruang untuk header yang melayang. */
export function ProsePage({ title, intro, children }: Props) {
  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 pb-24 pt-36">
      <header className="space-y-4">
        <h1 className="font-display text-5xl leading-tight sm:text-6xl">{title}</h1>
        <p className="text-lg text-muted-foreground">{intro}</p>
      </header>
      {children}
    </article>
  );
}

export function ProseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 leading-relaxed text-neutral-700 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

export { Em };
