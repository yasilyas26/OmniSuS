"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { applyActionError } from "@/lib/form";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

import { registerAction } from "../actions";
import { type RegisterInput, registerSchema } from "../schemas";

export function RegisterForm({ defaultEmail }: { defaultEmail?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await registerAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      // Sesi sudah dibuat; pemilik baru melengkapi profil UMKM dulu.
      router.replace("/onboarding");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FieldGroup>
        <TextField
          id="name"
          label="Nama lengkap"
          autoComplete="name"
          error={errors.name}
          {...register("name")}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register("email")}
        />
        <TextField
          id="password"
          label="Kata sandi"
          type="password"
          autoComplete="new-password"
          description={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}
          error={errors.password}
          {...register("password")}
        />
      </FieldGroup>
      <FormMessage message={formError} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Mendaftar…" : "Daftar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-foreground underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </form>
  );
}
