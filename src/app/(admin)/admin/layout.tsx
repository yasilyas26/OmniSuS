import type { Metadata } from "next";

import type { NavGroup } from "@/components/layout/app-nav";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdminPage } from "@/server/guards";

// Dashboard admin tidak boleh diindeks mesin pencari.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin OmniSUS" },
  robots: { index: false, follow: false },
};

const ADMIN_GROUPS: readonly NavGroup[] = [
  {
    label: "Platform",
    items: [
      { href: "/admin", label: "Ringkasan", icon: "dashboard", exact: true },
      { href: "/admin/umkm", label: "UMKM", icon: "businesses" },
      { href: "/admin/riwayat", label: "Riwayat perubahan", icon: "history" },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/admin/instrumen", label: "Instrumen & butir", icon: "instrument" },
      { href: "/admin/faktor", label: "Faktor", icon: "factor" },
      { href: "/admin/landing", label: "Konten landing", icon: "landing" },
    ],
  },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminPage();

  return (
    <AppShell
      logoHref="/admin"
      root="Admin"
      groups={ADMIN_GROUPS}
      userName={session.user.name}
      userNote="Admin platform"
      headerLink={{ href: "/", label: "Lihat situs" }}
    >
      {children}
    </AppShell>
  );
}
