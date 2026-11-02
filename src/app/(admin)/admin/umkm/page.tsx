import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RestoreBusinessButton, SECTOR_LABELS, businessService } from "@/features/business";
import { daysUntilPurge } from "@/lib/retention";

export const metadata: Metadata = { title: "UMKM" };

export default async function AdminBusinessesPage() {
  const businesses = await businessService.listForAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="UMKM terdaftar"
        description="UMKM yang dihapus pemiliknya bisa dipulihkan selama masa tenggang. Hapus permanen lewat CLI: pnpm data:purge."
      />
      <Panel title={`${businesses.length} UMKM`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Sektor</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">{business.name}</TableCell>
                <TableCell>{SECTOR_LABELS[business.sector]}</TableCell>
                <TableCell>{business.city}</TableCell>
                <TableCell className="space-x-2">
                  {business.deletedAt ? (
                    <Badge variant="destructive">
                      Dihapus · {daysUntilPurge(business.deletedAt)} hari lagi permanen
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Aktif</Badge>
                  )}
                  {business.isDemo ? <Badge variant="outline">Demo</Badge> : null}
                </TableCell>
                <TableCell className="text-right">
                  {business.deletedAt ? <RestoreBusinessButton businessId={business.id} /> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
