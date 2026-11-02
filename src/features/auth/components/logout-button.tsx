"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { logoutAction } from "../actions";

export function LogoutButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      await logoutAction();
      router.replace("/masuk");
      router.refresh();
    });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "group h-10 gap-2.5 rounded-xl border border-transparent px-3 font-medium text-muted-foreground transition-all",
        "hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive",
        "focus-visible:ring-destructive/30",
        compact && "justify-center px-0",
        className,
      )}
      aria-label={compact ? "Keluar" : undefined}
      title={compact ? "Keluar" : undefined}
    >
      <LogOut
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
      {compact ? null : isPending ? "Keluar…" : "Keluar"}
    </Button>
  );
}
