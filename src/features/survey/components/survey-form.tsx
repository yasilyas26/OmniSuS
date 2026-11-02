"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { saveSurveyAction } from "../actions";
import type { AnswerEntry, AnswerValue, SurveyFormData } from "../types";
import { QuestionRenderer } from "./question-renderer";
import { SurveySummary } from "./survey-summary";

type Props = { form: SurveyFormData; minEmployeeResponses: number };

const PERCENT = 100;

export function SurveyForm({ form, minEmployeeResponses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(form.answers);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { steps } = form;
  const onSummary = stepIndex >= steps.length;
  const step = steps[stepIndex];
  const progress = Math.round((Math.min(stepIndex, steps.length) / steps.length) * PERCENT);

  const entriesFor = (questionIds: readonly string[]): AnswerEntry[] =>
    questionIds.flatMap((id) => {
      const answer = answers[id];
      return answer ? [{ ...answer, questionId: id }] : [];
    });

  /** Autosave draf saat berpindah langkah; gagal simpan menahan pengguna di langkah ini. */
  const moveTo = (target: number) =>
    startTransition(async () => {
      setError(null);
      const questionIds = step ? step.questions.map((question) => question.id) : [];
      const entries = entriesFor(questionIds);
      if (entries.length > 0) {
        const result = await saveSurveyAction({
          assessmentId: form.assessmentId,
          answers: entries,
          final: false,
        });
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
      }
      setStepIndex(target);
      window.scrollTo({ top: 0 });
    });

  const submitFinal = () =>
    startTransition(async () => {
      setError(null);
      const allIds = steps.flatMap((s) => s.questions.map((question) => question.id));
      const result = await saveSurveyAction({
        assessmentId: form.assessmentId,
        answers: entriesFor(allIds),
        final: true,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      // Tidak perlu router.refresh(): revalidatePath di action sudah menyegarkan halaman, dan halaman itu
      // sendiri menampilkan ucapan terima kasih untuk respons yang sudah final.
      setSubmitted(true);
    });

  if (submitted) {
    return (
      <Alert role="status">
        <AlertDescription>
          Terima kasih, jawabanmu sudah terkirim.{" "}
          <Button variant="link" className="h-auto p-0" onClick={() => router.push("/dashboard")}>
            Kembali ke dashboard
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {form.role === "EMPLOYEE" ? (
        <Alert>
          <AlertDescription>
            Jawabanmu anonim. Pemilik hanya melihat rata-rata dari minimal {minEmployeeResponses}{" "}
            orang.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{onSummary ? "Ringkasan" : `Langkah ${stepIndex + 1} dari ${steps.length}`}</span>
          <span>{form.assessmentLabel}</span>
        </div>
        <Progress value={progress} aria-label="Progres pengisian" />
      </div>

      {onSummary ? (
        <SurveySummary
          steps={steps}
          answers={answers}
          isBusy={isPending}
          error={error}
          onJump={setStepIndex}
          onSubmit={submitFinal}
        />
      ) : step ? (
        <section className="space-y-8" aria-labelledby="step-title">
          <header className="space-y-1">
            <h2 id="step-title" className="text-xl font-semibold">
              {step.title}
            </h2>
            {step.description ? (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            ) : null}
          </header>

          {step.questions.map((question, index) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              number={index + 1}
              answer={answers[question.id]}
              onChange={(answer) =>
                setAnswers((current) => ({ ...current, [question.id]: answer }))
              }
            />
          ))}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              disabled={isPending || stepIndex === 0}
              onClick={() => moveTo(stepIndex - 1)}
            >
              Sebelumnya
            </Button>
            <Button disabled={isPending} onClick={() => moveTo(stepIndex + 1)}>
              {isPending
                ? "Menyimpan…"
                : stepIndex === steps.length - 1
                  ? "Lihat ringkasan"
                  : "Lanjut"}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
