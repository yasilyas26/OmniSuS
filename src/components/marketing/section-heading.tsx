import { Star } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Kata beremfasis dalam judul: serif miring, seperti pada referensi. */
export function Em({ children }: { children: ReactNode }) {
  return <em className="font-display italic">{children}</em>;
}

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: "default" | "inverse";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "default",
  className,
}: Props) {
  const inverse = tone === "inverse";
  return (
    <div className={cn("mx-auto max-w-3xl space-y-4 text-center", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider",
          inverse ? "border-white/30 bg-white/10 text-white" : "bg-muted/60",
        )}
      >
        <Star className="size-3.5 fill-blue-600 text-blue-600" aria-hidden />
        {eyebrow}
      </span>
      <h2
        className={cn("font-display text-4xl leading-tight sm:text-5xl", inverse && "text-white")}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("text-base", inverse ? "text-white/80" : "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
