import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionForm, instrumentsService } from "@/features/instruments";

export const metadata: Metadata = { title: "Faktor" };

export default async function DimensionsPage() {
  const dimensions = await instrumentsService.listDimensions();

  return (
    <>
      <PageHeader
        title="Faktor"
        description="Nama dan deskripsi faktor tampil di hasil penilaian dan landing page. Kode dan sifat gap tidak bisa diubah."
      />
      <div className="space-y-6">
        {dimensions.map((dimension) => (
          <Card key={dimension.id}>
            <CardHeader>
              <CardTitle>{dimension.name}</CardTitle>
              <CardDescription>
                {dimension.key} ·{" "}
                {dimension.isShared
                  ? "dinilai pemilik dan karyawan (ada gap)"
                  : "dinilai pemilik saja"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DimensionForm
                defaultValues={{
                  dimensionId: dimension.id,
                  name: dimension.name,
                  description: dimension.description,
                  nameEn: dimension.nameEn ?? "",
                  descriptionEn: dimension.descriptionEn ?? "",
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
