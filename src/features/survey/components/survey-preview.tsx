"use client";

import { useState } from "react";

import type { AnswerValue, SurveyQuestion } from "../types";
import { QuestionRenderer } from "./question-renderer";

type PreviewQuestion = Omit<SurveyQuestion, "options"> & {
  dimensionName: string | null;
  options: string[];
};

/** Pratinjau kuesioner persis seperti dilihat responden. Jawaban hanya di memori, tidak disimpan. */
export function SurveyPreview({ questions }: { questions: PreviewQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const groups = new Map<string, PreviewQuestion[]>();
  for (const question of questions) {
    const title = question.dimensionName ?? "Profil usaha";
    groups.set(title, [...(groups.get(title) ?? []), question]);
  }

  let number = 0;
  return (
    <div className="space-y-8">
      {[...groups].map(([title, items]) => (
        <section key={title} className="space-y-4">
          <h2 className="text-lg font-medium">{title}</h2>
          {items.map((question) => {
            number += 1;
            return (
              <QuestionRenderer
                key={question.id}
                number={number}
                question={{
                  ...question,
                  options: question.options.map((label, index) => ({
                    id: `${question.id}-${index}`,
                    label,
                  })),
                }}
                answer={answers[question.id]}
                onChange={(answer) => setAnswers((prev) => ({ ...prev, [question.id]: answer }))}
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}
