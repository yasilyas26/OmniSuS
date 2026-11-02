"use client";

import { useState } from "react";

import { FormMessage } from "@/components/form/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { AnswerValue, SurveyStep } from "../types";

type Props = {
  steps: SurveyStep[];
  answers: Record<string, AnswerValue>;
  isBusy: boolean;
  error: string | null;
  onJump: (stepIndex: number) => void;
  onSubmit: () => void;
};

export function SurveySummary({ steps, answers, isBusy, error, onJump, onSubmit }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = steps.map((step, index) => ({
    index,
    title: step.title,
    answered: step.questions.filter((question) => answers[question.id]).length,
    total: step.questions.length,
  }));
  const unanswered = rows.reduce((sum, row) => sum + (row.total - row.answered), 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Ringkasan</h2>
        <p className="text-sm text-muted-foreground">
          Periksa kelengkapan jawabanmu sebelum dikirim final.
        </p>
      </div>

      <ul className="divide-y rounded-lg border">
        {rows.map((row) => (
          <li key={row.index} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span>
              {row.title}{" "}
              <span
                className={
                  row.answered === row.total ? "text-muted-foreground" : "text-destructive"
                }
              >
                ({row.answered}/{row.total} terjawab)
              </span>
            </span>
            {row.answered < row.total ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJump(row.index)}
                disabled={isBusy}
              >
                Lengkapi
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <FormMessage message={error} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button disabled={unanswered > 0 || isBusy} className="w-full sm:w-auto">
            {unanswered > 0 ? `${unanswered} butir belum dijawab` : "Kirim final"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim jawaban sekarang?</DialogTitle>
            <DialogDescription>Jawaban tidak bisa diubah setelah dikirim final.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isBusy}>
              Periksa lagi
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                onSubmit();
              }}
              disabled={isBusy}
            >
              Ya, kirim final
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
