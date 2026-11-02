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

import { activateInstrumentAction, createDraftAction, deleteDraftAction } from "../actions";

/** Tombol "Buat versi baru" di daftar instrumen: menyalin versi yang dipilih menjadi draf. */
export function CreateDraftButton({
  instrumentId,
  label,
}: {
  instrumentId: string;
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = () =>
    startTransition(async () => {
      setError(null);
      const result = await createDraftAction({ instrumentId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.push(`/admin/instrumen/${result.data.instrumentId}`);
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={create} disabled={isPending}>
        {isPending ? "Membuat…" : label}
      </Button>
      {error ? (
        <p role="alert" className="max-w-56 text-right text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type EditorActionsProps = { instrumentId: string; code: string; issues: string[] };

/** Aktifkan atau hapus versi draf. Aktivasi diblokir jika masih ada masalah validasi. */
export function DraftActions({ instrumentId, code, issues }: EditorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const activate = () =>
    startTransition(async () => {
      setError(null);
      const result = await activateInstrumentAction({ instrumentId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setActivateOpen(false);
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      setError(null);
      const result = await deleteDraftAction({ instrumentId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.push("/admin/instrumen");
    });

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
        <DialogTrigger asChild>
          <Button disabled={issues.length > 0}>Aktifkan versi ini</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aktifkan {code}?</DialogTitle>
            <DialogDescription>
              Pengisian baru akan memakai versi ini. Respons yang sudah ada tetap memakai versi
              lamanya, dan setelah aktif versi ini tidak bisa diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <FormMessage message={error} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActivateOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={activate} disabled={isPending}>
              {isPending ? "Mengaktifkan…" : "Ya, aktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Hapus draf</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus draf {code}?</DialogTitle>
            <DialogDescription>
              Seluruh butir pada draf ini ikut terhapus. Versi aktif tidak terpengaruh.
            </DialogDescription>
          </DialogHeader>
          <FormMessage message={error} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={remove} disabled={isPending}>
              Hapus draf
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
