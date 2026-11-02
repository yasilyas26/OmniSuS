import type { ResultsView } from "../types";

/** Butir cross-check ditampilkan terpisah dari skor faktor; rata-rata karyawan hanya jika cukup responden. */
export function CrossCheckList({ items }: { items: ResultsView["crossChecks"] }) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.pairKey} className="rounded-lg border p-3 text-sm">
          <p className="font-medium">{item.statement}</p>
          <p className="mt-1 text-muted-foreground">
            Pemilik: {item.ownerValue ?? "—"} · Rata-rata karyawan:{" "}
            {item.employeeMean === null
              ? "— (belum cukup responden)"
              : item.employeeMean.toFixed(1)}{" "}
            <span className="text-xs">(skala 1–5)</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
