"use client";

import {
  Building2,
  ClipboardList,
  Globe,
  History,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Settings2,
  Shapes,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// Ikon dirujuk lewat nama karena fungsi komponen tidak bisa diteruskan dari Server Component.
const ICONS = {
  dashboard: LayoutDashboard,
  assessment: ClipboardList,
  employees: Users,
  business: Building2,
  admin: ShieldCheck,
  instrument: ListChecks,
  factor: Shapes,
  landing: Globe,
  settings: Settings2,
  history: History,
  businesses: Store,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof ICONS;

/** `exact`: aktif hanya pada rute itu sendiri (untuk menu induk seperti /admin). */
export type NavItem = { href: string; label: string; icon: NavIcon; exact?: boolean };
export type NavGroup = { label?: string; items: readonly NavItem[] };

export function isActive(pathname: string, item: NavItem) {
  return pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
}

export function AppNav({
  groups,
  collapsed = false,
}: {
  groups: readonly NavGroup[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu utama"
      className="flex gap-1 overflow-x-auto md:flex-col md:gap-5 md:overflow-visible"
    >
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex gap-1 md:flex-col">
          {group.label ? (
            <p
              className={cn(
                "hidden px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase",
                collapsed ? "md:hidden" : "md:block",
              )}
            >
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl",
                  collapsed && "md:justify-center md:px-0",
                  " border border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-border bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                )}
              >
                <Icon aria-hidden className={cn("size-4", active && "text-primary")} />
                <span className={cn(collapsed && "md:sr-only")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
