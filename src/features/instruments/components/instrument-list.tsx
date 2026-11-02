import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CreateDraftButton } from "./instrument-actions";

type Item = {
  id: string;
  code: string;
  targetRole: "OWNER" | "EMPLOYEE";
  version: number;
  isActive: boolean;
  questionCount: number;
  responseCount: number;
};

const ROLE_LABELS = { OWNER: "Pemilik", EMPLOYEE: "Karyawan" } as const;

function statusOf(item: Item) {
  if (item.isActive) return { label: "Aktif", variant: "default" as const };
  if (item.responseCount === 0) return { label: "Draf", variant: "secondary" as const };
  return { label: "Arsip", variant: "outline" as const };
}

export function InstrumentList({ items }: { items: Item[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Versi</TableHead>
          <TableHead>Untuk</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Butir</TableHead>
          <TableHead className="text-right">Respons</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const status = statusOf(item);
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell>{ROLE_LABELS[item.targetRole]}</TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.questionCount}</TableCell>
              <TableCell className="text-right tabular-nums">{item.responseCount}</TableCell>
              <TableCell>
                <div className="flex items-start justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/instrumen/${item.id}`}>
                      {status.label === "Draf" ? "Sunting" : "Lihat"}
                    </Link>
                  </Button>
                  <CreateDraftButton instrumentId={item.id} label="Buat versi baru" />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
