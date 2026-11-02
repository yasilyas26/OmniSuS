import type { ResultCategory } from "@/lib/categories";

export type DimensionRow = {
  dimensionId: string;
  name: string;
  isShared: boolean;
  ownerScore: number | null;
  employeeScore: number | null;
  gap: number | null;
  interpretation: string | null;
};

export type ResultsView = {
  assessment: { id: string; label: string; openedAt: Date; closedAt: Date | null };
  summary: {
    ownerScore: number;
    employeeScore: number | null;
    combinedScore: number;
    category: ResultCategory;
    employeeRespondents: number;
  };
  employeeDataHidden: boolean;
  minEmployeeResponses: number;
  dimensions: DimensionRow[];
  gaps: DimensionRow[];
  crossChecks: {
    pairKey: string;
    statement: string;
    ownerValue: number | null;
    employeeMean: number | null;
  }[];
  history: {
    id: string;
    label: string;
    closedAt: Date | null;
    ownerScore: number;
    employeeScore: number | null;
    combinedScore: number;
  }[];
};
