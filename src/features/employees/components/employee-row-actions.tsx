"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { cancelInvitationAction, setEmployeeStatusAction } from "../actions";

type Props =
  | { kind: "employee"; membershipId: string; status: "ACTIVE" | "DISABLED" }
  | { kind: "invitation"; invitationId: string };

export function EmployeeRowActions(props: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => ReturnType<typeof cancelInvitationAction>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });

  const onClick = () =>
    props.kind === "invitation"
      ? run(() => cancelInvitationAction({ invitationId: props.invitationId }))
      : run(() =>
          setEmployeeStatusAction({
            membershipId: props.membershipId,
            status: props.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
          }),
        );

  const label =
    props.kind === "invitation"
      ? "Batalkan"
      : props.status === "ACTIVE"
        ? "Nonaktifkan"
        : "Aktifkan";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={onClick} disabled={isPending}>
        {isPending ? "Memproses…" : label}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
