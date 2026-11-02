import type { Metadata } from "next";

import type { NavGroup } from "@/components/layout/app-nav";
import { AppShell } from "@/components/layout/app-shell";
import { getSession, requireMembership } from "@/server/guards";

// Halaman di balik login tidak boleh diindeks mesin pencari.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const OWNER_GROUPS: readonly NavGroup[] = [
  {
    label: "Menu utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/penilaian", label: "Penilaian", icon: "assessment" },
    ],
  },
  {
    label: "Kelola usaha",
    items: [
      { href: "/karyawan", label: "Karyawan", icon: "employees" },
      { href: "/umkm", label: "Profil UMKM", icon: "business" },
    ],
  },
];

const EMPLOYEE_GROUPS: readonly NavGroup[] = [
  {
    label: "Menu utama",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
];

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const member = await requireMembership();
  const session = await getSession();
  const baseGroups = member.role === "OWNER" ? OWNER_GROUPS : EMPLOYEE_GROUPS;
  // Admin platform yang juga punya UMKM mendapat jalan pintas ke dashboard admin.
  const groups = session?.user.isAdmin
    ? [...baseGroups, { items: [{ href: "/admin", label: "Admin", icon: "admin" as const }] }]
    : baseGroups;

  return (
    <AppShell
      logoHref="/dashboard"
      root="OmniSUS"
      groups={groups}
      userName={session?.user.name ?? ""}
      userNote={member.role === "OWNER" ? "Pemilik" : "Karyawan"}
    >
      {children}
    </AppShell>
  );
}
