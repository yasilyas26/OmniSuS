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

import { openAssessmentAction } from "../actions";
import { type OpenAssessmentInput, openAssessmentSchema } from "../schemas";

export function OpenAssessmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OpenAssessmentInput>({ resolver: zodResolver(openAssessmentSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await openAssessmentAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldGroup>
        <TextField
          id="label"
          label="Nama periode"
          description='Contoh: "Q4 2026".'
          error={errors.label}
          {...register("label")}
        />
      </FieldGroup>
      <FormMessage message={formError} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Membuka…" : "Buka periode baru"}
      </Button>
    </form>
  );
}
