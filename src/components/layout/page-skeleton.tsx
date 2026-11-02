import { Skeleton } from "@/components/ui/skeleton";

/** Kerangka tunggu yang menyerupai tata letak halaman dashboard (judul + kartu + panel). */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Memuat halaman" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="hidden h-36 rounded-3xl xl:block" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
