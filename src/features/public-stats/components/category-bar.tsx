import type { ResultCategory } from "@/lib/categories";
import { fillTokens } from "@/lib/emphasis";
import type { Messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const ORDER: ResultCategory[] = ["HEALTHY", "FAIR", "AT_RISK"];
const PERCENT = 100;

// Warna selalu disertai label dan angka di legenda (tidak hanya mengandalkan warna).
const SEGMENT_STYLES: Record<ResultCategory, string> = {
  HEALTHY: "bg-emerald-500",
  FAIR: "bg-amber-400",
  AT_RISK: "bg-red-500",
};

type Props = { distribution: Record<ResultCategory, number>; m: Messages["stats"] };

export function CategoryBar({ distribution, m }: Props) {
  const total = ORDER.reduce((sum, key) => sum + distribution[key], 0);
  if (total === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-muted" role="presentation">
        {ORDER.map((key) => (
          <span
            key={key}
            className={cn(SEGMENT_STYLES[key])}
            style={{ width: `${(distribution[key] / total) * PERCENT}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {ORDER.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <span className={cn("size-3 rounded-full", SEGMENT_STYLES[key])} aria-hidden />
            {fillTokens(m.categoryLine, {
              label: m.categories[key],
              n: distribution[key],
              percent: Math.round((distribution[key] / total) * PERCENT),
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
