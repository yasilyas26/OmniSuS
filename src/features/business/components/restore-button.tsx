"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { restoreBusinessAction } from "../actions";

export function RestoreBusinessButton({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const restore = () =>
    startTransition(async () => {
      setError(null);
      const result = await restoreBusinessAction({ businessId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={restore} disabled={isPending}>
        {isPending ? "Memulihkan…" : "Pulihkan"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
