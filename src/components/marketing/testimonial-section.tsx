import { Quote } from "lucide-react";

import type { SiteContent } from "@/features/site-content";

import { EmphasisText } from "./emphasis-text";
import { Marquee } from "./marquee";
import { SectionHeading } from "./section-heading";

type Testimonial = SiteContent["testimonials"]["items"][number];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <li className="relative mt-8 flex w-80 shrink-0 flex-col rounded-[2rem] bg-muted/60 px-7 pb-6 pt-12 sm:w-[22rem]">
      <span
        aria-hidden
        className="absolute -top-8 left-7 flex size-16 items-center justify-center rounded-full bg-neutral-950 text-lg font-medium text-white ring-4 ring-background"
      >
        {initials(item.name)}
      </span>
      <Quote className="size-7 fill-neutral-950" aria-hidden />
      <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-neutral-700">
        {item.quote}
      </blockquote>
      <p className="mt-6 text-sm font-medium">{item.name}</p>
      <p className="text-sm text-muted-foreground">{item.role}</p>
      <p aria-hidden className="mt-4 text-right font-display text-3xl italic">
        {item.name}
      </p>
    </li>
  );
}

export function TestimonialSection({
  content,
  eyebrow,
}: {
  content: SiteContent["testimonials"];
  eyebrow: string;
}) {
  return (
    <section id="testimonial" className="scroll-mt-24 overflow-hidden py-24">
      <div className="space-y-14">
        <SectionHeading
          eyebrow={eyebrow}
          title={<EmphasisText text={content.title} />}
          description={content.description}
          className="px-4"
        />
        <Marquee duration="60s">
          <ul className="flex gap-6">
            {content.items.map((item) => (
              <TestimonialCard key={item.name} item={item} />
            ))}
          </ul>
        </Marquee>
      </div>
    </section>
  );
}
