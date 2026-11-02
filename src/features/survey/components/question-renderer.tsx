"use client";

import type { AnswerValue, SurveyQuestion } from "../types";
import { OptionGroup } from "./option-group";

const NOT_APPLICABLE = "na";

const LIKERT_OPTIONS = [
  { value: "1", label: "Sangat tidak setuju" },
  { value: "2", label: "Tidak setuju" },
  { value: "3", label: "Netral" },
  { value: "4", label: "Setuju" },
  { value: "5", label: "Sangat setuju" },
] as const;

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Ya" },
  { value: "false", label: "Tidak" },
] as const;

type Props = {
  question: SurveyQuestion;
  number: number;
  answer: AnswerValue | undefined;
  onChange: (answer: AnswerValue) => void;
};

/** Satu pintu untuk semua jenis butir; pemilihan input berdasarkan `question.type`. */
export function QuestionRenderer({ question, number, answer, onChange }: Props) {
  const legend = `${number}. ${question.text}`;

  if (question.type === "LIKERT") {
    const selected =
      answer?.kind === "na"
        ? NOT_APPLICABLE
        : answer?.kind === "likert"
          ? String(answer.value)
          : undefined;
    return (
      <OptionGroup
        name={question.id}
        legend={legend}
        layout="row"
        options={LIKERT_OPTIONS}
        value={selected}
        extraOption={
          question.allowNotApplicable
            ? { value: NOT_APPLICABLE, label: "Tidak berlaku" }
            : undefined
        }
        onChange={(value) =>
          onChange(
            value === NOT_APPLICABLE ? { kind: "na" } : { kind: "likert", value: Number(value) },
          )
        }
      />
    );
  }

  if (question.type === "BOOLEAN") {
    return (
      <OptionGroup
        name={question.id}
        legend={legend}
        options={BOOLEAN_OPTIONS}
        value={answer?.kind === "boolean" ? String(answer.value) : undefined}
        onChange={(value) => onChange({ kind: "boolean", value: value === "true" })}
      />
    );
  }

  return (
    <OptionGroup
      name={question.id}
      legend={legend}
      options={question.options.map((option) => ({ value: option.id, label: option.label }))}
      value={answer?.kind === "choice" ? answer.optionId : undefined}
      onChange={(optionId) => onChange({ kind: "choice", optionId })}
    />
  );
}
