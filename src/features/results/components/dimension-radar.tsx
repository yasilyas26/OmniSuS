"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DimensionRow } from "../types";

const CHART_HEIGHT = 340;
const MAX_SCORE = 100;
const FILL_OPACITY = 0.25;

type Props = { dimensions: DimensionRow[]; showEmployee: boolean };

export function DimensionRadar({ dimensions, showEmployee }: Props) {
  const data = dimensions.map((dimension) => ({
    name: dimension.name,
    owner: dimension.ownerScore ?? 0,
    // Faktor khusus owner tidak punya skor karyawan; ditandai 0 agar bentuk radar tetap tertutup.
    employee: dimension.employeeScore ?? 0,
  }));

  const summary = dimensions
    .map(
      (d) =>
        `${d.name}: owner ${d.ownerScore ?? "tidak ada"}${showEmployee && d.employeeScore !== null ? `, karyawan ${d.employeeScore}` : ""}`,
    )
    .join("; ");

  return (
    <figure aria-label="Radar skor per faktor" className="w-full">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        {/* Margin kiri-kanan memberi ruang bagi label faktor yang panjang di layar sempit. */}
        <RadarChart
          data={data}
          outerRadius="62%"
          margin={{ top: 16, right: 56, bottom: 16, left: 56 }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, MAX_SCORE]} tickCount={5} />
          <Radar
            name="Pemilik"
            dataKey="owner"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={FILL_OPACITY}
            isAnimationActive={false}
          />
          {showEmployee ? (
            <Radar
              name="Karyawan (rata-rata)"
              dataKey="employee"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={FILL_OPACITY}
              isAnimationActive={false}
            />
          ) : null}
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
