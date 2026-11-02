import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUDIT_LABELS, listRecentAudit } from "@/server/audit";

export const metadata: Metadata = { title: "Riwayat perubahan" };

const dateTime = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminHistoryPage() {
  const entries = await listRecentAudit();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat perubahan"
        description="100 perubahan terakhir oleh admin dan penghapusan UMKM. Hanya metadata; tidak ada jawaban atau data pribadi."
      />
      <Panel title="Aktivitas terbaru">
        {entries.length === 0 ? (
          <p className="text-muted-foreground">Belum ada perubahan yang tercatat.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Oleh</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Sasaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {dateTime.format(entry.createdAt)}
                  </TableCell>
                  <TableCell>{entry.actorName ?? "—"}</TableCell>
                  <TableCell>{AUDIT_LABELS[entry.action] ?? entry.action}</TableCell>
                  <TableCell className="max-w-64 truncate font-mono text-xs">
                    {entry.target ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
