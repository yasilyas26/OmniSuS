import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/features/auth";

import { AppBreadcrumb } from "./app-breadcrumb";
import type { NavGroup } from "./app-nav";
import { AppSidebar } from "./app-sidebar";

type Props = {
  logoHref: string;
  /** Nama bagian aplikasi di remah roti, mis. "OmniSUS" atau "Admin". */
  root: string;
  groups: readonly NavGroup[];
  userName: string;
  userNote: string;
  headerLink?: { href: string; label: string };
  children: ReactNode;
};

/** Kerangka dashboard: sidebar bergrup + header remah roti. Dipakai area pengguna dan admin. */
export function AppShell({
  logoHref,
  root,
  groups,
  userName,
  userNote,
  headerLink,
  children,
}: Props) {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-background md:flex-row">
      <AppSidebar logoHref={logoHref} groups={groups} userLabel={`${userName} · ${userNote}`} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-dashed px-4 py-3 md:px-8">
          <AppBreadcrumb root={root} groups={groups} />
          <div className="flex items-center gap-3">
            {headerLink ? (
              <Link
                href={headerLink.href}
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {headerLink.label}
              </Link>
            ) : null}
            <span className="max-w-48 truncate md:hidden text-sm text-muted-foreground">
              {userName} · {userNote}
            </span>
            <LogoutButton className="md:hidden" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
