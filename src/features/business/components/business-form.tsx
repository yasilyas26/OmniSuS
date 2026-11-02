"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyActionError } from "@/lib/form";

import { createBusinessAction, updateBusinessAction } from "../actions";
import {
  BUSINESS_SECTORS,
  type BusinessProfileInput,
  SECTOR_LABELS,
  businessProfileSchema,
} from "../schemas";

type Props = {
  mode: "create" | "update";
  defaultValues?: BusinessProfileInput;
};

const EMPTY_VALUES = { name: "", city: "", foundedYear: null };

export function BusinessForm({ mode, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const result =
        mode === "create" ? await createBusinessAction(values) : await updateBusinessAction(values);
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      if (mode === "create") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setSaved(true);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FieldGroup>
        <TextField id="name" label="Nama usaha" error={errors.name} {...register("name")} />

        <Controller
          control={control}
          name="sector"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="sector">Sektor usaha</FieldLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="sector" className="w-full" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Pilih sektor" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {SECTOR_LABELS[sector]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <TextField id="city" label="Kota" error={errors.city} {...register("city")} />
        <TextField
          id="employeeCount"
          label="Jumlah karyawan"
          type="number"
          inputMode="numeric"
          min={0}
          description="Tidak termasuk pemilik."
          error={errors.employeeCount}
          {...register("employeeCount", { valueAsNumber: true })}
        />
        <TextField
          id="foundedYear"
          label="Tahun berdiri (opsional)"
          type="number"
          inputMode="numeric"
          error={errors.foundedYear}
          {...register("foundedYear", {
            setValueAs: (value: string) => (value === "" || value == null ? null : Number(value)),
          })}
        />
      </FieldGroup>

      <FormMessage message={formError} />
      <FormMessage message={saved ? "Profil UMKM disimpan." : null} tone="success" />

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Menyimpan…" : mode === "create" ? "Simpan & lanjut" : "Simpan perubahan"}
      </Button>
    </form>
  );
}
