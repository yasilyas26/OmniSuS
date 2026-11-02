export type AnswerValue =
  | { kind: "likert"; value: number }
  | { kind: "na" }
  | { kind: "boolean"; value: boolean }
  | { kind: "choice"; optionId: string };

export type AnswerEntry = AnswerValue & { questionId: string };

export type SurveyQuestion = {
  id: string;
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  text: string;
  allowNotApplicable: boolean;
  options: { id: string; label: string }[];
};

export type SurveyStep = {
  id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
};

export type SurveyFormData = {
  assessmentId: string;
  assessmentLabel: string;
  assessmentStatus: "OPEN" | "CLOSED";
  role: "OWNER" | "EMPLOYEE";
  responseStatus: "NONE" | "DRAFT" | "SUBMITTED";
  steps: SurveyStep[];
  /** Hanya jawaban milik pengguna yang sedang login. */
  answers: Record<string, AnswerValue>;
};
