"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Resolver,
  get,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { ICONS, ICON_NAMES, type IconName } from "@/components/marketing/icons";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n/config";

import { resetSectionAction, saveSectionAction } from "../actions";
import type { FieldDef, ListDef, SectionDef } from "../editor-config";
import { siteContentSchemas } from "../schemas";

type Props = {
  def: SectionDef;
  locale: Locale;
  initial: Record<string, unknown>;
  customized: boolean;
};

type FieldInputProps = {
  field: FieldDef;
  path: string;
  /** Nama section; mencegah id ganda karena banyak section punya kolom "title". */
  scope: string;
  control: Control<FieldValues>;
  error: unknown;
};

function FieldInput({ field, path, scope, control, error }: FieldInputProps) {
  const id = `f-${scope}-${path.replaceAll(".", "-")}`;
  const message = (error as { message?: string } | undefined)?.message;

  return (
    <Controller
      control={control}
      name={path}
      render={({ field: rhf }) => (
        <Field data-invalid={message ? true : undefined}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          {field.kind === "textarea" ? (
            <Textarea
              id={id}
              rows={3}
              aria-invalid={message ? true : undefined}
              {...rhf}
              value={rhf.value ?? ""}
            />
          ) : field.kind === "icon" ? (
            <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
              <SelectTrigger id={id} className="w-full" aria-invalid={message ? true : undefined}>
                <SelectValue placeholder="Pilih ikon" />
              </SelectTrigger>
              <SelectContent>
                {ICON_NAMES.map((name) => {
                  const Icon = ICONS[name as IconName];
                  return (
                    <SelectItem key={name} value={name}>
                      <Icon className="size-4" aria-hidden /> {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={id}
              aria-invalid={message ? true : undefined}
              {...rhf}
              value={rhf.value ?? ""}
            />
          )}
          {field.hint ? <FieldDescription>{field.hint}</FieldDescription> : null}
          <FieldError errors={[message ? { message } : undefined]} />
        </Field>
      )}
    />
  );
}

function ListEditor({
  list,
  scope,
  control,
  errors,
}: {
  list: ListDef;
  scope: string;
  control: Control<FieldValues>;
  errors: unknown;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: list.name });
  const blank = Object.fromEntries(
    list.fields.map((f) => [f.name, f.kind === "icon" ? ICON_NAMES[0] : ""]),
  );
  const rootMessage = (get(errors, `${list.name}.root`) ?? get(errors, list.name)) as
    { message?: string } | undefined;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{list.label}</legend>
      {fields.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {list.itemTitle} {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={fields.length <= list.min}
              onClick={() => remove(index)}
              aria-label={`Hapus ${list.itemTitle} ${index + 1}`}
            >
              <Trash2 aria-hidden /> Hapus
            </Button>
          </div>
          <FieldGroup>
            {list.fields.map((f) => (
              <FieldInput
                key={f.name}
                field={f}
                scope={scope}
                path={`${list.name}.${index}.${f.name}`}
                control={control}
                error={get(errors, `${list.name}.${index}.${f.name}`)}
              />
            ))}
          </FieldGroup>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length >= list.max}
        onClick={() => append(blank)}
      >
        <Plus aria-hidden /> Tambah {list.itemTitle.toLowerCase()}
      </Button>
      {rootMessage?.message ? (
        <p role="alert" className="text-sm text-destructive">
          {rootMessage.message}
        </p>
      ) : null}
    </fieldset>
  );
}

export function SectionForm({ def, locale, initial, customized }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "error" | "success" } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(siteContentSchemas[def.key]) as unknown as Resolver<FieldValues>,
    defaultValues: initial,
  });

  const save = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSectionAction({ section: def.key, locale, data: values });
      if (!result.ok) {
        setMessage({ text: result.error.message, tone: "error" });
        return;
      }
      setMessage({ text: "Tersimpan. Landing page diperbarui.", tone: "success" });
      router.refresh();
    });
  });

  const restoreDefault = () =>
    startTransition(async () => {
      setMessage(null);
      const result = await resetSectionAction({ section: def.key, locale });
      if (!result.ok) {
        setMessage({ text: result.error.message, tone: "error" });
        return;
      }
      setMessage({ text: "Dikembalikan ke teks bawaan.", tone: "success" });
      router.refresh();
      reset();
    });

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <FieldGroup>
        {def.fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            scope={def.key}
            path={f.name}
            control={control}
            error={get(errors, f.name)}
          />
        ))}
      </FieldGroup>
      {def.lists.map((list) => (
        <ListEditor key={list.name} list={list} scope={def.key} control={control} errors={errors} />
      ))}

      <FormMessage message={message?.tone === "error" ? message.text : null} />
      <FormMessage message={message?.tone === "success" ? message.text : null} tone="success" />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan…" : "Simpan"}
        </Button>
        {customized ? (
          <Button type="button" variant="outline" disabled={isPending} onClick={restoreDefault}>
            Kembalikan ke bawaan
          </Button>
        ) : null}
      </div>
    </form>
  );
}
