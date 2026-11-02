"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ResultsView } from "../types";

const CHART_HEIGHT = 280;
const MAX_SCORE = 100;

export function TrendChart({ history }: { history: ResultsView["history"] }) {
  const data = history.map((item) => ({
    name: item.label,
    gabungan: item.combinedScore,
    pemilik: item.ownerScore,
    karyawan: item.employeeScore,
  }));
  const summary = data.map((d) => `${d.name}: gabungan ${d.gabungan}`).join("; ");

  return (
    <figure aria-label="Tren skor antarperiode" className="w-full">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, MAX_SCORE]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="gabungan"
            name="Gabungan"
            stroke="var(--foreground)"
            strokeWidth={2}
          />
          <Line type="monotone" dataKey="pemilik" name="Pemilik" stroke="var(--chart-1)" />
          <Line
            type="monotone"
            dataKey="karyawan"
            name="Karyawan"
            stroke="var(--chart-2)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
