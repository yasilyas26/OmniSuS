import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = { children: ReactNode; duration?: string; className?: string };

/**
 * Pita berjalan tanpa JavaScript. Isi digandakan dan digeser -50% berulang, jadi tanpa lompatan.
 * Berhenti saat di-hover, dan statis (bisa digulir) jika pengguna memilih mengurangi gerakan.
 */
export function Marquee({ children, duration = "45s", className }: Props) {
  return (
    <div
      className={cn(
        "group/marquee overflow-hidden motion-reduce:overflow-x-auto",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="animate-marquee flex w-max group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ "--marquee-duration": duration } as CSSProperties}
      >
        <div className="flex shrink-0 gap-6 pr-6">{children}</div>
        <div className="flex shrink-0 gap-6 pr-6" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
