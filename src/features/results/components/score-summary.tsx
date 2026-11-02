import { CategoryBadge } from "@/components/category-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";

import type { ResultsView } from "../types";

const formatScore = (score: number | null) => (score === null ? "—" : score.toFixed(1));

type Props = Pick<
  ResultsView,
  "assessment" | "summary" | "employeeDataHidden" | "minEmployeeResponses"
>;

export function ScoreSummary({
  assessment,
  summary,
  employeeDataHidden,
  minEmployeeResponses,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skor keseluruhan · {assessment.label}</CardTitle>
        <CardDescription>
          {assessment.closedAt ? `Ditutup ${formatDate(assessment.closedAt)}. ` : ""}
          Skor adalah indikator persepsi dari survei mandiri, bukan audit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <p
            className="text-5xl font-semibold tabular-nums"
            aria-label={`Skor gabungan ${formatScore(summary.combinedScore)} dari 100`}
          >
            {formatScore(summary.combinedScore)}
          </p>
          <CategoryBadge category={summary.category} />
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Skor pemilik</dt>
            <dd className="text-lg font-medium tabular-nums">{formatScore(summary.ownerScore)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rata-rata karyawan</dt>
            <dd className="text-lg font-medium tabular-nums">
              {formatScore(summary.employeeScore)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Karyawan yang mengisi</dt>
            <dd className="text-lg font-medium tabular-nums">{summary.employeeRespondents}</dd>
          </div>
        </dl>

        {employeeDataHidden ? (
          <Alert role="status">
            <AlertDescription>
              Data karyawan tidak cukup untuk ditampilkan secara anonim (minimal{" "}
              {minEmployeeResponses} responden). Skor di atas hanya memakai penilaian pemilik.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
