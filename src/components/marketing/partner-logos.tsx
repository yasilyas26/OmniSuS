import type { SiteContent } from "@/features/site-content";

import { ICONS } from "./icons";
import { Marquee } from "./marquee";

export function PartnerLogos({
  content,
  label,
}: {
  content: SiteContent["partners"];
  label: string;
}) {
  return (
    <section aria-label={label} className="border-b bg-white py-8">
      <Marquee duration="35s">
        {content.items.map(({ name, icon }) => {
          const Icon = ICONS[icon];
          return (
            <div key={name} className="flex items-center gap-2 px-6 text-neutral-500">
              <Icon className="size-6" aria-hidden />
              <span className="whitespace-nowrap text-lg font-semibold tracking-tight">{name}</span>
            </div>
          );
        })}
      </Marquee>
      {content.caption ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">{content.caption}</p>
      ) : null}
    </section>
  );
}
