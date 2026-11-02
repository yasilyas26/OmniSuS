"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { applyActionError } from "@/lib/form";

import { inviteEmployeeAction } from "../actions";
import { type InviteEmployeeInput, inviteEmployeeSchema } from "../schemas";

type CreatedInvitation = { inviteUrl: string; expiresAt: Date };

export function InviteForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvitation | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<InviteEmployeeInput>({ resolver: zodResolver(inviteEmployeeSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setCreated(null);
    setCopied(false);
    startTransition(async () => {
      const result = await inviteEmployeeAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      setCreated(result.data);
      reset();
    });
  });

  const copyLink = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.inviteUrl);
    setCopied(true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FieldGroup>
          <TextField
            id="invite-name"
            label="Nama karyawan"
            error={errors.name}
            {...register("name")}
          />
          <TextField
            id="invite-email"
            label="Email karyawan"
            type="email"
            error={errors.email}
            {...register("email")}
          />
        </FieldGroup>
        <FormMessage message={formError} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Membuat tautan…" : "Buat tautan undangan"}
        </Button>
      </form>

      {created ? (
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4" role="status">
          <p className="text-sm font-medium">Tautan undangan siap dibagikan</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={created.inviteUrl}
              aria-label="Tautan undangan"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" variant="outline" onClick={copyLink}>
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied ? "Tersalin" : "Salin"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tautan ini hanya ditampilkan sekali dan berlaku sampai {formatDate(created.expiresAt)}.
            Karyawan menetapkan kata sandinya sendiri.
          </p>
        </div>
      ) : null}
    </div>
  );
}
