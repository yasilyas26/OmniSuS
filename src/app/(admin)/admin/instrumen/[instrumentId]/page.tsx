import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreateDraftButton,
  DraftActions,
  QuestionDialog,
  QuestionTable,
  instrumentsService,
} from "@/features/instruments";
import { AppError } from "@/lib/errors";

export const metadata: Metadata = { title: "Sunting instrumen" };

export default async function InstrumentEditorPage({
  params,
}: PageProps<"/admin/instrumen/[instrumentId]">) {
  const { instrumentId } = await params;
  const editor = await instrumentsService.getEditor(instrumentId).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  const { instrument, editable, questions, dimensions, responseCount, activationIssues } = editor;

  const status = instrument.isActive ? "Aktif" : editable ? "Draf" : "Arsip";

  return (
    <>
      <PageHeader
        title={instrument.code}
        description={`Instrumen untuk ${instrument.targetRole === "OWNER" ? "pemilik" : "karyawan"} · ${questions.length} butir`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={instrument.isActive ? "default" : "secondary"}>{status}</Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/instrumen/${instrumentId}/pratinjau`}>Pratinjau</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/instrumen">Semua versi</Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {editable ? (
          <Card>
            <CardHeader>
              <CardTitle>Draf yang bisa disunting</CardTitle>
              <CardDescription>
                Tambah, ubah, urutkan, atau hapus butir. Perubahan baru berlaku setelah versi ini
                diaktifkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activationIssues.length > 0 ? (
                <Alert role="status">
                  <AlertDescription>
                    <strong>Belum bisa diaktifkan:</strong>
                    <ul className="mt-1 list-disc pl-5">
                      {activationIssues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <QuestionDialog
                  instrumentId={instrument.id}
                  dimensions={dimensions}
                  trigger={<Button>Tambah butir</Button>}
                />
                <DraftActions
                  instrumentId={instrument.id}
                  code={instrument.code}
                  issues={activationIssues}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert role="status">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {instrument.isActive
                  ? "Versi ini sedang aktif sehingga tidak bisa diubah."
                  : `Versi ini sudah dipakai ${responseCount} respons sehingga tidak bisa diubah.`}{" "}
                Untuk mengubah butir, buat versi baru.
              </span>
              <CreateDraftButton instrumentId={instrument.id} label="Buat versi baru dari ini" />
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Butir</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionTable
              instrumentId={instrument.id}
              questions={questions}
              dimensions={dimensions}
              editable={editable}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
