import { ICONS, type IconName } from "./icons";

type Item = { icon: IconName; title: string; description: string };

/** Kartu ikon abu-abu membulat yang dipakai bersama oleh section Core features dan Benefit. */
export function FeatureCards({ items }: { items: readonly Item[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
      {items.map(({ icon, title, description }) => {
        const Icon = ICONS[icon];
        return (
          <li key={title} className="rounded-3xl bg-muted/60 p-7">
            <span className="flex size-12 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-6 text-lg font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </li>
        );
      })}
    </ul>
  );
}
