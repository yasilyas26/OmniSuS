"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

import { closeAssessmentAction } from "../actions";

type Props = {
  assessmentId: string;
  employeeSubmittedCount: number;
  minEmployeeResponses: number;
  ownerSubmitted: boolean;
};

export function CloseAssessmentDialog({
  assessmentId,
  employeeSubmittedCount,
  minEmployeeResponses,
  ownerSubmitted,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [withoutEmployees, setWithoutEmployees] = useState(false);

  const enoughEmployees = employeeSubmittedCount >= minEmployeeResponses;

  const confirm = () =>
    startTransition(async () => {
      setError(null);
      const result = await closeAssessmentAction({
        assessmentId,
        allowWithoutEmployees: withoutEmployees,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setOpen(false);
      router.push(`/penilaian/${assessmentId}/hasil`);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!ownerSubmitted}>
          Tutup periode & hitung hasil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tutup periode ini?</DialogTitle>
          <DialogDescription>
            Hasil dihitung lalu disimpan dan tidak bisa diubah lagi. Karyawan tidak bisa mengisi
            setelah periode ditutup.
          </DialogDescription>
        </DialogHeader>

        {enoughEmployees ? (
          <p className="text-sm">
            {employeeSubmittedCount} karyawan sudah mengirim final. Data karyawan akan ikut
            dihitung.
          </p>
        ) : (
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={withoutEmployees}
              onChange={(event) => setWithoutEmployees(event.target.checked)}
            />
            <span>
              Baru {employeeSubmittedCount} karyawan yang mengirim final (minimal{" "}
              {minEmployeeResponses} agar jawaban tetap anonim). Saya sadar, tutup tanpa data
              karyawan.
            </span>
          </label>
        )}

        <FormMessage message={error} />

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={confirm} disabled={isPending || (!enoughEmployees && !withoutEmployees)}>
            {isPending ? "Menghitung…" : "Tutup & hitung"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
