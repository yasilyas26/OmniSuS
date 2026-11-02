import { z } from "zod";

import { MIN_CHOICE_OPTIONS } from "./activation";

const MAX_OPTIONS = 12;

export const questionFormSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1, "Kode butir wajib diisi.")
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Hanya huruf, angka, tanda - dan _."),
    type: z.enum(["LIKERT", "BOOLEAN", "CHOICE"]),
    text: z.string().trim().min(3, "Teks butir minimal 3 karakter.").max(400),
    dimensionId: z.uuid().nullable(),
    polarity: z.enum(["POSITIVE", "NEGATIVE"]).nullable(),
    allowNotApplicable: z.boolean(),
    pairKey: z.string().trim().max(60).nullable(),
    weight: z.number({ error: "Isi bobot." }).min(0.1, "Minimal 0,1.").max(10, "Maksimal 10."),
    options: z
      .array(z.object({ label: z.string().trim().min(1, "Opsi tidak boleh kosong.").max(160) }))
      .max(MAX_OPTIONS),
  })
  .superRefine((value, ctx) => {
    if (value.type === "LIKERT" && !value.polarity) {
      ctx.addIssue({
        code: "custom",
        path: ["polarity"],
        message: "Pilih polaritas untuk butir Likert.",
      });
    }
    if (value.type !== "LIKERT" && value.polarity) {
      ctx.addIssue({
        code: "custom",
        path: ["polarity"],
        message: "Polaritas hanya untuk butir Likert.",
      });
    }
    if (value.type !== "LIKERT" && value.allowNotApplicable) {
      ctx.addIssue({
        code: "custom",
        path: ["allowNotApplicable"],
        message: 'Opsi "Tidak berlaku" hanya untuk butir Likert.',
      });
    }
    if (value.type === "CHOICE" && value.options.length < MIN_CHOICE_OPTIONS) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `Butir pilihan butuh minimal ${MIN_CHOICE_OPTIONS} opsi.`,
      });
    }
    if (value.type !== "CHOICE" && value.options.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Opsi hanya untuk butir pilihan.",
      });
    }
  });

export type QuestionFormInput = z.infer<typeof questionFormSchema>;

export const saveQuestionSchema = z.object({
  instrumentId: z.uuid(),
  questionId: z.uuid().nullable(),
  question: questionFormSchema,
});

export const questionTargetSchema = z.object({ instrumentId: z.uuid(), questionId: z.uuid() });
export const moveQuestionSchema = questionTargetSchema.extend({
  direction: z.enum(["UP", "DOWN"]),
});
export const instrumentIdSchema = z.object({ instrumentId: z.uuid() });

// Terjemahan Inggris boleh kosong (string kosong disimpan sebagai null oleh service).
export const dimensionFormSchema = z.object({
  dimensionId: z.uuid(),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter.").max(600),
  nameEn: z.string().trim().max(120),
  descriptionEn: z.string().trim().max(600),
});
export type DimensionFormInput = z.infer<typeof dimensionFormSchema>;
