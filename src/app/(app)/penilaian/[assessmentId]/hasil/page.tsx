import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CrossCheckList,
  DimensionRadar,
  GapTable,
  ScoreSummary,
  TrendChart,
  resultsService,
} from "@/features/results";
import { requireRolePage } from "@/server/guards";

export const metadata: Metadata = { title: "Hasil penilaian" };

export default async function ResultsPage({
  params,
}: PageProps<"/penilaian/[assessmentId]/hasil">) {
  const { assessmentId } = await params;
  const member = await requireRolePage("OWNER");
  const view = await resultsService.getForOwner(member, assessmentId);
  if (!view) notFound();

  return (
    <>
      <PageHeader title="Hasil penilaian" description={view.assessment.label} />
      <div className="space-y-6">
        <ScoreSummary
          assessment={view.assessment}
          summary={view.summary}
          employeeDataHidden={view.employeeDataHidden}
          minEmployeeResponses={view.minEmployeeResponses}
        />

        <Card>
          <CardHeader>
            <CardTitle>Skor per faktor</CardTitle>
            <CardDescription>
              Skala 0–100. Faktor khusus pemilik tidak punya skor karyawan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DimensionRadar dimensions={view.dimensions} showEmployee={!view.employeeDataHidden} />
          </CardContent>
        </Card>

        {view.gaps.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Gap persepsi pemilik vs karyawan</CardTitle>
              <CardDescription>
                Gap = skor pemilik − skor karyawan. Pemilik menilai dirinya sendiri, jadi selisih
                menunjukkan perbedaan persepsi, bukan siapa yang benar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GapTable gaps={view.gaps} />
            </CardContent>
          </Card>
        ) : null}

        {view.crossChecks.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Butir cross-check</CardTitle>
              <CardDescription>
                Pertanyaan serupa yang dijawab pemilik dan karyawan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrossCheckList items={view.crossChecks} />
            </CardContent>
          </Card>
        ) : null}

        {view.history.length > 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Tren antarperiode</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart history={view.history} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
