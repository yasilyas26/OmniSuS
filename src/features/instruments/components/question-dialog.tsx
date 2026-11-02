"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormMessage } from "@/components/form/form-message";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyActionError } from "@/lib/form";

import { saveQuestionAction } from "../actions";
import { type QuestionFormInput, questionFormSchema } from "../schemas";

export type EditableQuestion = {
  id: string;
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  text: string;
  dimensionId: string | null;
  polarity: "POSITIVE" | "NEGATIVE" | null;
  allowNotApplicable: boolean;
  pairKey: string | null;
  weight: string;
  options: string[];
};

type Props = {
  instrumentId: string;
  dimensions: { id: string; name: string }[];
  question?: EditableQuestion;
  trigger: ReactNode;
};

const NO_DIMENSION = "none";
const TYPE_LABELS = {
  LIKERT: "Skala Likert (diskor)",
  BOOLEAN: "Ya / Tidak",
  CHOICE: "Pilihan",
} as const;

function defaults(question?: EditableQuestion): QuestionFormInput {
  if (!question) {
    return {
      key: "",
      type: "LIKERT",
      text: "",
      dimensionId: null,
      polarity: "POSITIVE",
      allowNotApplicable: false,
      pairKey: "",
      weight: 1,
      options: [],
    };
  }
  return {
    key: question.key,
    type: question.type,
    text: question.text,
    dimensionId: question.dimensionId,
    polarity: question.polarity,
    allowNotApplicable: question.allowNotApplicable,
    pairKey: question.pairKey ?? "",
    weight: Number(question.weight),
    options: question.options.map((label) => ({ label })),
  };
}

export function QuestionDialog({ instrumentId, dimensions, question, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuestionFormInput>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: defaults(question),
  });
  const options = useFieldArray({ control, name: "options" });
  const type = useWatch({ control, name: "type" });

  const onTypeChange = (next: QuestionFormInput["type"]) => {
    setValue("type", next, { shouldValidate: true });
    // Kolom yang tidak relevan untuk tipe baru dikosongkan agar lolos validasi.
    setValue("polarity", next === "LIKERT" ? "POSITIVE" : null);
    if (next !== "LIKERT") setValue("allowNotApplicable", false);
    if (next !== "CHOICE") options.replace([]);
    if (next === "CHOICE" && options.fields.length === 0)
      options.replace([{ label: "" }, { label: "" }]);
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveQuestionAction({
        instrumentId,
        questionId: question?.id ?? null,
        question: values,
      });
      if (!result.ok) {
        setFormError(applyActionError(result.error, setError));
        return;
      }
      setOpen(false);
      if (!question) reset(defaults());
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{question ? `Ubah butir ${question.key}` : "Tambah butir"}</DialogTitle>
          <DialogDescription>
            Perubahan hanya berlaku pada versi draf ini sampai diaktifkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FieldGroup>
            <TextField
              id="q-key"
              label="Kode butir"
              description="Unik di dalam versi ini, mis. O-LD9."
              error={errors.key}
              {...register("key")}
            />

            <Field data-invalid={errors.text ? true : undefined}>
              <FieldLabel htmlFor="q-text">Teks butir</FieldLabel>
              <Textarea
                id="q-text"
                rows={3}
                aria-invalid={errors.text ? true : undefined}
                {...register("text")}
              />
              <FieldError errors={[errors.text]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="q-type">Jenis butir</FieldLabel>
              <Select
                value={type}
                onValueChange={(v) => onTypeChange(v as QuestionFormInput["type"])}
              >
                <SelectTrigger id="q-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Controller
              control={control}
              name="dimensionId"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="q-dimension">Faktor</FieldLabel>
                  <Select
                    value={field.value ?? NO_DIMENSION}
                    onValueChange={(v) => field.onChange(v === NO_DIMENSION ? null : v)}
                  >
                    <SelectTrigger id="q-dimension" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_DIMENSION}>
                        Tanpa faktor (profil / cross-check)
                      </SelectItem>
                      {dimensions.map((dimension) => (
                        <SelectItem key={dimension.id} value={dimension.id}>
                          {dimension.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Butir Likert tanpa faktor tidak ikut skor faktor; dipakai sebagai cross-check.
                  </FieldDescription>
                </Field>
              )}
            />

            {type === "LIKERT" ? (
              <>
                <Controller
                  control={control}
                  name="polarity"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid ? true : undefined}>
                      <FieldLabel htmlFor="q-polarity">Polaritas</FieldLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger id="q-polarity" className="w-full">
                          <SelectValue placeholder="Pilih polaritas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POSITIVE">Positif (setuju = baik)</SelectItem>
                          <SelectItem value="NEGATIVE">
                            Negatif (setuju = buruk, dibalik saat skoring)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <TextField
                  id="q-weight"
                  label="Bobot"
                  type="number"
                  step="0.1"
                  error={errors.weight}
                  {...register("weight", { valueAsNumber: true })}
                />
                <Controller
                  control={control}
                  name="allowNotApplicable"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="q-na"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      <FieldLabel htmlFor="q-na">
                        Sediakan opsi &quot;Tidak berlaku&quot;
                      </FieldLabel>
                    </Field>
                  )}
                />
              </>
            ) : null}

            <TextField
              id="q-pair"
              label="Kunci pasangan cross-check (opsional)"
              description="Butir owner dan karyawan dengan kunci sama ditampilkan berdampingan di hasil."
              error={errors.pairKey}
              {...register("pairKey")}
            />

            {type === "CHOICE" ? (
              <Field data-invalid={errors.options ? true : undefined}>
                <FieldLabel>Opsi jawaban</FieldLabel>
                <div className="space-y-2">
                  {options.fields.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <input
                        aria-label={`Opsi ${index + 1}`}
                        className="h-9 min-w-0 flex-1 rounded-lg border bg-transparent px-3 text-sm"
                        {...register(`options.${index}.label` as const)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Hapus opsi ${index + 1}`}
                        onClick={() => options.remove(index)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => options.append({ label: "" })}
                  >
                    <Plus aria-hidden /> Tambah opsi
                  </Button>
                </div>
                <FieldError errors={[errors.options?.root ?? errors.options]} />
              </Field>
            ) : null}
          </FieldGroup>

          <FormMessage message={formError} />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan…" : "Simpan butir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
