import { z } from "zod";

const questionId = z.uuid();

export const answerEntrySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("likert"),
    questionId,
    value: z.number().int().min(1).max(5),
  }),
  z.object({ kind: z.literal("na"), questionId }),
  z.object({ kind: z.literal("boolean"), questionId, value: z.boolean() }),
  z.object({ kind: z.literal("choice"), questionId, optionId: z.uuid() }),
]);

export const submitSurveySchema = z.object({
  assessmentId: z.uuid(),
  answers: z.array(answerEntrySchema),
  final: z.boolean(),
});

export type SubmitSurveyInput = z.infer<typeof submitSurveySchema>;
