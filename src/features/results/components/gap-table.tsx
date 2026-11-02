import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { DimensionRow } from "../types";

const formatScore = (score: number | null) => (score === null ? "—" : score.toFixed(1));
const formatGap = (gap: number) => `${gap > 0 ? "+" : ""}${gap.toFixed(1)}`;

/** Tabel gap diurutkan dari selisih terbesar; juga menjadi alternatif teks untuk grafik radar. */
export function GapTable({ gaps }: { gaps: DimensionRow[] }) {
  if (gaps.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Faktor</TableHead>
          <TableHead className="text-right">Pemilik</TableHead>
          <TableHead className="text-right">Karyawan</TableHead>
          <TableHead className="text-right">Gap</TableHead>
          <TableHead>Interpretasi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gaps.map((row) => (
          <TableRow key={row.dimensionId}>
            <TableCell className="min-w-40 whitespace-normal font-medium">{row.name}</TableCell>
            <TableCell className="text-right tabular-nums">{formatScore(row.ownerScore)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatScore(row.employeeScore)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {row.gap === null ? "—" : formatGap(row.gap)}
            </TableCell>
            {/* Lebar minimum mencegah teks dibungkus per kata di ponsel; tabel menggulir di dalam kartunya. */}
            <TableCell className="min-w-72 whitespace-normal text-muted-foreground">
              {row.interpretation}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
