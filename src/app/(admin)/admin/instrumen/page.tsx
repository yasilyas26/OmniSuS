import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { InstrumentList, instrumentsService } from "@/features/instruments";

export const metadata: Metadata = { title: "Instrumen & butir" };

export default async function InstrumentsPage() {
  const items = await instrumentsService.list();

  return (
    <>
      <PageHeader
        title="Instrumen & butir"
        description="Kelola kuesioner untuk pemilik dan karyawan lewat versi."
      />
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            Versi yang sudah aktif atau sudah dijawab tidak bisa diubah, supaya hasil lama tetap
            sah. Untuk mengubah butir: <strong>Buat versi baru</strong> (draf), ubah butirnya, lalu{" "}
            <strong>Aktifkan</strong>. Pengisian yang sedang berjalan tetap memakai versi lamanya.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent>
            <InstrumentList items={items} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
