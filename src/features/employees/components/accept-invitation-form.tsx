"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { applyActionError } from "@/lib/form";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

import { acceptInvitationAction } from "../actions";
import { type AcceptInvitationInput, acceptInvitationSchema } from "../schemas";

export function AcceptInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { token },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await acceptInvitationAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="hidden" {...register("token")} />
      <FieldGroup>
        <TextField
          id="password"
          label="Buat kata sandi"
          type="password"
          autoComplete="new-password"
          description={`Minimal ${MIN_PASSWORD_LENGTH} karakter. Hanya kamu yang mengetahuinya, pemilik tidak.`}
          error={errors.password}
          {...register("password")}
        />
      </FieldGroup>
      <FormMessage message={formError} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Menyimpan…" : "Aktifkan akun"}
      </Button>
    </form>
  );
}
