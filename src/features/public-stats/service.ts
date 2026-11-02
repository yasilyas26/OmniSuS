import "server-only";

import type { Locale } from "@/lib/i18n/config";

import {
  queryCapitalSources,
  queryCategories,
  queryDimensions,
  queryOverview,
  queryProfileFlags,
  querySectors,
} from "./repository";
import { type LandingStats, OTHER_GROUP_KEY } from "./types";

const PERCENT = 100;
// Kelompok yang lebih kecil dari ini digabung ke "Lainnya" agar UMKM tidak bisa diidentifikasi (SECURITY §5).
const MIN_GROUP_SIZE = 3;

const toNumber = (value: string | null) => (value === null ? null : Number(value));
const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * PERCENT);

/** Mengelompokkan; entri di bawah ambang digabung. Kelompok "Lainnya" itu sendiri juga disamarkan bila kecil. */
function groupSmall(rows: { label: string; total: number }[]) {
  const kept = rows.filter((row) => row.total >= MIN_GROUP_SIZE);
  const otherTotal = rows
    .filter((row) => row.total < MIN_GROUP_SIZE)
    .reduce((sum, row) => sum + row.total, 0);
  const merged =
    otherTotal >= MIN_GROUP_SIZE ? [...kept, { label: OTHER_GROUP_KEY, total: otherTotal }] : kept;
  return merged.sort((a, b) => b.total - a.total);
}

export const publicStatsService = {
  /** Hanya agregat dari periode tertutup terakhir per UMKM; tanpa nama atau identitas apa pun. */
  async getLandingStats(locale: Locale): Promise<LandingStats> {
    const [overview, categories, dimensions, sectors, flags, capital] = await Promise.all([
      queryOverview(),
      queryCategories(),
      queryDimensions(),
      querySectors(),
      queryProfileFlags(),
      queryCapitalSources(),
    ]);

    const businessCount = overview?.businesses ?? 0;
    const byCategory = new Map(categories.map((row) => [row.category, row.total]));
    const flag = (key: string) => {
      const row = flags.find((item) => item.key === key);
      return row ? pct(row.yes, row.total) : null;
    };

    return {
      businessCount,
      respondentCount: overview?.respondents ?? 0,
      averageScore: toNumber(overview?.avg_score ?? null),
      hasDemoData: overview?.has_demo ?? false,
      categoryDistribution: {
        HEALTHY: byCategory.get("HEALTHY") ?? 0,
        FAIR: byCategory.get("FAIR") ?? 0,
        AT_RISK: byCategory.get("AT_RISK") ?? 0,
      },
      healthyPercent: pct(byCategory.get("HEALTHY") ?? 0, businessCount),
      dimensions: dimensions.map((row) => ({
        key: row.key,
        // Terjemahan Inggris opsional; jika kosong pakai teks Indonesia.
        name: (locale === "en" && row.name_en) || row.name,
        description: (locale === "en" && row.description_en) || row.description,
        isShared: row.is_shared,
        ownerAverage: toNumber(row.owner_avg),
        employeeAverage: toNumber(row.employee_avg),
      })),
      bySector: groupSmall(sectors.map((row) => ({ label: row.sector, total: row.total }))),
      profile: {
        nibPercent: flag("P1"),
        governmentFundingPercent: flag("P2"),
        governmentProgramPercent: flag("P3"),
        capitalSources: groupSmall(capital),
      },
    };
  },
};
