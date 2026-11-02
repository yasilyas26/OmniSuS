import type { Messages } from "@/lib/i18n/messages";

import type { LandingDimension } from "../types";

const MAX_SCORE = 100;

function Bar({ label, value, color }: { label: string; value: number | null; color: string }) {
  if (value === null) return null;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full rounded-full ${color}`}
          style={{ width: `${(value / MAX_SCORE) * 100}%` }}
        />
      </span>
      <span className="w-10 text-right font-medium tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

type Props = { dimensions: LandingDimension[]; m: Messages["stats"] };

/** Rata-rata skor per faktor di seluruh UMKM. Tanpa data → kartu faktor tetap tampil dengan deskripsinya. */
export function DimensionBars({ dimensions, m }: Props) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {dimensions.map((dimension) => (
        <li key={dimension.key} className="rounded-3xl bg-muted/60 p-6">
          <h3 className="font-medium">{dimension.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{dimension.description}</p>
          <div className="mt-4 space-y-2">
            <Bar label={m.owner} value={dimension.ownerAverage} color="bg-blue-600" />
            <Bar label={m.employee} value={dimension.employeeAverage} color="bg-orange-500" />
          </div>
        </li>
      ))}
    </ul>
  );
}
