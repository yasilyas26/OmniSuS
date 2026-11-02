import Link from "next/link";

import { CategoryBadge } from "@/components/category-badge";
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
import type { ResultCategory } from "@/lib/categories";
import { formatDate } from "@/lib/dates";

type Item = {
  id: string;
  label: string;
  status: "OPEN" | "CLOSED";
  openedAt: Date;
  closedAt: Date | null;
  category: ResultCategory | null;
  combinedScore: string | null;
};

export function AssessmentList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada periode penilaian. Buka periode pertama untuk memulai.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Periode</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Hasil</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">
                Dibuka {formatDate(item.openedAt)}
                {item.closedAt ? ` · Ditutup ${formatDate(item.closedAt)}` : ""}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.status === "OPEN" ? "secondary" : "outline"}>
                {item.status === "OPEN" ? "Terbuka" : "Ditutup"}
              </Badge>
            </TableCell>
            <TableCell>
              {item.category && item.combinedScore ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {Number(item.combinedScore).toFixed(1)}
                  </span>
                  <CategoryBadge category={item.category} />
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {item.status === "OPEN" ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/penilaian/${item.id}/isi`}>Isi kuesioner</Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/penilaian/${item.id}/hasil`}>Lihat hasil</Link>
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
