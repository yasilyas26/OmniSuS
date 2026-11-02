import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { SurveyForm, surveyService } from "@/features/survey";
import { requireMembership } from "@/server/guards";

export const metadata: Metadata = { title: "Isi kuesioner" };

export default async function SurveyPage({ params }: PageProps<"/penilaian/[assessmentId]/isi">) {
  const { assessmentId } = await params;
  const member = await requireMembership();
  const form = await surveyService.getForm(member, assessmentId);

  const blocked =
    form.assessmentStatus === "CLOSED"
      ? "Periode ini sudah ditutup, jadi kuesioner tidak bisa diisi lagi."
      : form.responseStatus === "SUBMITTED"
        ? // Juga layar setelah kirim final: revalidatePath di action merender ulang halaman ini.
          "Terima kasih, jawabanmu sudah terkirim dan tidak bisa diubah lagi."
        : null;

  return (
    <>
      <PageHeader
        title="Kuesioner"
        description={form.role === "OWNER" ? "Penilaian oleh pemilik" : "Penilaian oleh karyawan"}
      />
      {blocked ? (
        <div className="max-w-xl space-y-4">
          <Alert role="status">
            <AlertDescription>{blocked}</AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/dashboard">Kembali ke dashboard</Link>
          </Button>
        </div>
      ) : (
        <SurveyForm form={form} minEmployeeResponses={env.MIN_EMPLOYEE_RESPONSES} />
      )}
    </>
  );
}
