"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

import { deleteQuestionAction, moveQuestionAction } from "../actions";
import { type EditableQuestion, QuestionDialog } from "./question-dialog";

type Props = {
  instrumentId: string;
  question: EditableQuestion;
  dimensions: { id: string; name: string }[];
  isFirst: boolean;
  isLast: boolean;
};

export function QuestionRowActions({ instrumentId, question, dimensions, isFirst, isLast }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = (
    action: () => Promise<{ ok: boolean; error?: { message: string } }>,
    onDone?: () => void,
  ) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(result.error?.message ?? "Gagal.");
        return;
      }
      onDone?.();
      router.refresh();
    });

  const move = (direction: "UP" | "DOWN") =>
    run(() => moveQuestionAction({ instrumentId, questionId: question.id, direction }));

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Naikkan ${question.key}`}
          disabled={isPending || isFirst}
          onClick={() => move("UP")}
        >
          <ArrowUp aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Turunkan ${question.key}`}
          disabled={isPending || isLast}
          onClick={() => move("DOWN")}
        >
          <ArrowDown aria-hidden />
        </Button>
        <QuestionDialog
          instrumentId={instrumentId}
          dimensions={dimensions}
          question={question}
          trigger={
            <Button variant="outline" size="icon" aria-label={`Ubah ${question.key}`}>
              <Pencil aria-hidden />
            </Button>
          }
        />
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" aria-label={`Hapus ${question.key}`}>
              <Trash2 aria-hidden />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus butir {question.key}?</DialogTitle>
              <DialogDescription>
                Butir dihapus dari versi draf ini saja. Versi yang sudah aktif tidak terpengaruh.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  run(
                    () => deleteQuestionAction({ instrumentId, questionId: question.id }),
                    () => setConfirmOpen(false),
                  )
                }
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
