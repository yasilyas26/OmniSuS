"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { applyActionError } from "@/lib/form";

import { updateDimensionAction } from "../actions";
import { type DimensionFormInput, dimensionFormSchema } from "../schemas";

export function DimensionForm({ defaultValues }: { defaultValues: DimensionFormInput }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DimensionFormInput>({ resolver: zodResolver(dimensionFormSchema), defaultValues });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDimensionAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      setSaved(true);
      router.refresh();
    });
  });

  const id = (name: string) => `${defaultValues.dimensionId}-${name}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldGroup className="md:grid md:grid-cols-2">
        <TextField
          id={id("name")}
          label="Nama (Indonesia)"
          error={errors.name}
          {...register("name")}
        />
        <TextField
          id={id("nameEn")}
          label="Nama (Inggris)"
          error={errors.nameEn}
          {...register("nameEn")}
        />
        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor={id("description")}>Deskripsi (Indonesia)</FieldLabel>
          <Textarea id={id("description")} rows={3} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Field data-invalid={errors.descriptionEn ? true : undefined}>
          <FieldLabel htmlFor={id("descriptionEn")}>Deskripsi (Inggris)</FieldLabel>
          <Textarea id={id("descriptionEn")} rows={3} {...register("descriptionEn")} />
          <FieldError errors={[errors.descriptionEn]} />
        </Field>
      </FieldGroup>
      <FormMessage message={formError} />
      <FormMessage message={saved ? "Faktor disimpan." : null} tone="success" />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan…" : "Simpan faktor"}
      </Button>
    </form>
  );
}
