"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { type NavGroup, isActive } from "./app-nav";

/** Remah roti sederhana: bagian aplikasi › menu yang sedang aktif. */
export function AppBreadcrumb({ root, groups }: { root: string; groups: readonly NavGroup[] }) {
  const pathname = usePathname();
  const current = groups
    .flatMap((group) => group.items)
    .filter((item) => isActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>{root}</span>
      {current ? (
        <>
          <ChevronRight aria-hidden className="size-3.5" />
          <span className="font-medium text-foreground">{current.label}</span>
        </>
      ) : null}
    </p>
  );
}
