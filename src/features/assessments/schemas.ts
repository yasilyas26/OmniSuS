import { z } from "zod";

export const openAssessmentSchema = z.object({
  label: z.string().trim().min(2, "Label minimal 2 karakter.").max(80),
});

export const closeAssessmentSchema = z.object({
  assessmentId: z.uuid(),
  allowWithoutEmployees: z.boolean(),
});

export type OpenAssessmentInput = z.infer<typeof openAssessmentSchema>;
export type CloseAssessmentInput = z.infer<typeof closeAssessmentSchema>;
