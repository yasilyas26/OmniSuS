import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AssessmentList,
  CloseAssessmentDialog,
  OpenAssessmentForm,
  ProgressCard,
  assessmentsService,
} from "@/features/assessments";
import { requireRolePage } from "@/server/guards";

export const metadata: Metadata = { title: "Penilaian" };

export default async function AssessmentsPage() {
  const member = await requireRolePage("OWNER");
  const [items, open] = await Promise.all([
    assessmentsService.list(member),
    assessmentsService.getOpen(member),
  ]);
  const progress = open ? await assessmentsService.getProgress(member, open.id) : null;

  return (
    <>
      <PageHeader title="Penilaian" description="Periode penilaian kondisi internal UMKM." />
      <div className="space-y-6">
        {open && progress ? (
          <Card>
            <CardHeader>
              <CardTitle>Periode berjalan: {open.label}</CardTitle>
              <CardDescription>
                Isi kuesionermu, undang karyawan mengisi, lalu tutup periode untuk melihat hasil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProgressCard {...progress} />
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/penilaian/${open.id}/isi`}>Isi kuesioner pemilik</Link>
                </Button>
                <CloseAssessmentDialog
                  assessmentId={open.id}
                  ownerSubmitted={progress.ownerSubmitted}
                  employeeSubmittedCount={progress.employeeSubmittedCount}
                  minEmployeeResponses={progress.minEmployeeResponses}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Buka periode baru</CardTitle>
              <CardDescription>
                Hanya satu periode yang bisa terbuka dalam satu waktu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpenAssessmentForm />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Riwayat periode</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentList items={items} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
