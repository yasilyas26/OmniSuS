import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Kata beremfasis dalam judul: serif miring, seperti pada referensi. */
export function Em({ children }: { children: ReactNode }) {
  return <em className="font-display italic">{children}</em>;
}

type Props = {
  /** Tidak ditampilkan lagi; dipertahankan agar pemanggil tidak perlu diubah. */
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  tone?: "default" | "inverse";
  className?: string;
};

export function SectionHeading({ title, description, tone = "default", className }: Props) {
  const inverse = tone === "inverse";
  return (
    <div className={cn("mx-auto max-w-3xl space-y-4 text-center", className)}>
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
