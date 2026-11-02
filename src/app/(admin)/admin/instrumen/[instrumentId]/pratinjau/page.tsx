import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { instrumentsService } from "@/features/instruments";
import { SurveyPreview } from "@/features/survey";
import { AppError } from "@/lib/errors";

export const metadata: Metadata = { title: "Pratinjau instrumen" };

export default async function InstrumentPreviewPage({
  params,
}: {
  params: Promise<{ instrumentId: string }>;
}) {
  const { instrumentId } = await params;
  const { instrument, questions } = await instrumentsService
    .getEditor(instrumentId)
    .catch((error: unknown) => {
      if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
      throw error;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pratinjau ${instrument.code}`}
        description="Tampilan yang dilihat responden. Jawaban di sini tidak disimpan."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/instrumen/${instrumentId}`}>Kembali ke editor</Link>
          </Button>
        }
      />
      <Alert role="status">
        <AlertDescription>
          Mode pratinjau: tidak ada data yang dikirim ke database.
        </AlertDescription>
      </Alert>
      <div className="max-w-2xl">
        <SurveyPreview
          questions={questions.map((question) => ({
            id: question.id,
            key: question.key,
            type: question.type,
            text: question.text,
            allowNotApplicable: question.allowNotApplicable,
            dimensionName: question.dimensionName,
            options: question.options,
          }))}
        />
      </div>
    </div>
  );
}
