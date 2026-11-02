import type { ResultCategory } from "@/lib/categories";

/** Kunci kelompok gabungan untuk kategori yang terlalu kecil; diterjemahkan di UI. */
export const OTHER_GROUP_KEY = "__other__";

export type LandingDimension = {
  key: string;
  name: string;
  description: string;
  isShared: boolean;
  ownerAverage: number | null;
  employeeAverage: number | null;
};

export type LandingStats = {
  businessCount: number;
  respondentCount: number;
  averageScore: number | null;
  /** True jika ada data seed demo di dalam agregat: UI wajib menampilkan label "Data demo". */
  hasDemoData: boolean;
  categoryDistribution: Record<ResultCategory, number>;
  healthyPercent: number;
  dimensions: LandingDimension[];
  bySector: { label: string; total: number }[];
  profile: {
    nibPercent: number | null;
    governmentFundingPercent: number | null;
    governmentProgramPercent: number | null;
    capitalSources: { label: string; total: number }[];
  };
};
