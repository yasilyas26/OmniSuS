"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Logo, LogoMark } from "@/components/marketing/logo";
import { LogoutButton } from "@/features/auth";
import { cn } from "@/lib/utils";

import { AppNav, type NavGroup } from "./app-nav";

const STORAGE_KEY = "omnisus-sidebar-collapsed";

type Props = { logoHref: string; groups: readonly NavGroup[]; userLabel: string };

const CHANGE_EVENT = "omnisus-sidebar-change";

// Preferensi hanya kenyamanan per perangkat; gagal baca/tulis storage tidak boleh mengganggu.
function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(notify: () => void) {
  window.addEventListener(CHANGE_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGE_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

/** Sidebar yang bisa dilipat (desktop). Di layar kecil menjadi bilah atas dan tidak dilipat. */
export function AppSidebar({ logoHref, groups, userLabel }: Props) {
  // Server selalu merender versi terbuka; klien menyesuaikan setelah hidrasi.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  const toggle = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "0" : "1");
    } catch {
      /* storage tidak tersedia */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex flex-col border-b bg-sidebar transition-[width] duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0",
        collapsed ? "md:w-[4.5rem]" : "md:w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-3 md:border-b md:border-dashed md:py-5",
          collapsed && "md:flex-col md:px-2",
        )}
      >
        {collapsed ? (
          <>
            <Link href={logoHref} aria-label="OmniSUS" className="hidden md:block">
              <LogoMark />
            </Link>
            <Logo href={logoHref} className="md:hidden" />
          </>
        ) : (
          <Logo href={logoHref} />
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Perluas sidebar" : "Lipat sidebar"}
          aria-expanded={!collapsed}
          className="hidden size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground md:flex"
        >
          <ToggleIcon aria-hidden className="size-4" />
        </button>
      </div>

      <div className="px-3 pb-3 md:flex-1 md:py-5">
        <AppNav groups={groups} collapsed={collapsed} />
      </div>

      <div className={cn("hidden border-t border-dashed p-3 md:block", collapsed && "px-2")}>
        <div className="space-y-2">
          {collapsed ? null : (
            <p className="truncate px-1 text-xs text-muted-foreground">{userLabel}</p>
          )}
          <LogoutButton compact={collapsed} className="w-full justify-start" />
        </div>
      </div>
    </aside>
  );
}
