import { fillTokens } from "@/lib/emphasis";
import type { Messages } from "@/lib/i18n/messages";

import { type LandingStats, OTHER_GROUP_KEY } from "../types";

function Percent({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <div className="rounded-3xl bg-muted/60 p-6 text-center">
      <p className="font-display text-5xl leading-none">{value}%</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type Row = { label: string; total: number };

function Tally({ title, rows, unit }: { title: string; rows: Row[]; unit: string }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-3xl bg-muted/60 p-6">
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between gap-3">
            <span>{row.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {fillTokens(unit, { n: row.total })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = Pick<LandingStats, "profile" | "bySector"> & { m: Messages };

/** Profil usaha bersifat deskriptif: bukan indikator sehat atau tidaknya UMKM (PRD §9). */
export function ProfileStats({ profile, bySector, m }: Props) {
  const label = (key: string, dictionary: Record<string, string>) =>
    key === OTHER_GROUP_KEY ? m.stats.other : (dictionary[key] ?? key);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Percent label={m.stats.hasNib} value={profile.nibPercent} />
        <Percent label={m.stats.funding} value={profile.governmentFundingPercent} />
        <Percent label={m.stats.program} value={profile.governmentProgramPercent} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Tally
          title={m.stats.sectorTitle}
          unit={m.stats.unit}
          rows={bySector.map((row) => ({ ...row, label: label(row.label, m.sectors) }))}
        />
        <Tally
          title={m.stats.capitalTitle}
          unit={m.stats.unit}
          rows={profile.capitalSources.map((row) => ({
            ...row,
            label: label(row.label, m.stats.capital),
          }))}
        />
      </div>
    </div>
  );
}
