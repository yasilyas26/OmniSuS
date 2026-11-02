import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type ResultCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

// Warna selalu disertai label teks (FRONTEND.md §8) agar tidak bergantung pada warna saja.
const CATEGORY_STYLES: Record<ResultCategory, string> = {
  HEALTHY:
    "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  FAIR: "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  AT_RISK: "border-transparent bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

/** `label` opsional untuk bahasa selain Indonesia (halaman publik berbahasa Inggris). */
export function CategoryBadge({ category, label }: { category: ResultCategory; label?: string }) {
  return (
    <Badge className={cn(CATEGORY_STYLES[category])}>{label ?? CATEGORY_LABELS[category]}</Badge>
  );
}
