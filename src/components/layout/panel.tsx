import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Kartu berbingkai: bingkai bergaris miring berisi kartu putih. */
export function Panel({ title, icon, className, children }: PanelProps) {
  return (
    <section className={cn("bg-stripes rounded-3xl border p-1.5", className)}>
      <h2 className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground">
        {title}
        {icon ? <span aria-hidden>{icon}</span> : null}
      </h2>
      <div className="rounded-2xl border bg-card p-4 text-sm md:p-5">{children}</div>
    </section>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  note?: string;
  icon?: ReactNode;
  /** Batang mini: tiap angka 0–1 menentukan tinggi; yang terakhir disorot. */
  bars?: readonly number[];
};

export function StatCard({ title, value, note, icon, bars }: StatCardProps) {
  return (
    <Panel title={title} icon={icon}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-3xl font-medium tracking-tight">{value}</p>
          {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
        </div>
        {bars ? (
          <div aria-hidden className="flex h-14 items-end gap-1.5">
            {bars.map((height, index) => (
              <span
                key={index}
                style={{ height: `${Math.max(height, 0.12) * 100}%` }}
                className={cn(
                  "w-3 rounded-sm",
                  index === bars.length - 1 ? "bg-primary" : "bg-muted-foreground/15",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
