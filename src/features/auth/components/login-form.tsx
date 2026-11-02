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

import { loginAction } from "../actions";
import { type LoginInput, loginSchema } from "../schemas";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await loginAction(values);
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
      <FieldGroup>
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
          autoComplete="current-password"
          error={errors.password}
          {...register("password")}
        />
      </FieldGroup>
      <FormMessage message={formError} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Masuk…" : "Masuk"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-foreground underline underline-offset-4">
          Daftar sebagai pemilik UMKM
        </Link>
      </p>
    </form>
  );
}
