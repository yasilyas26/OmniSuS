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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DELETION_GRACE_DAYS } from "@/lib/retention";

import { deleteBusinessAction } from "../actions";

/** Zona berbahaya: soft delete UMKM, dikonfirmasi dengan mengetik nama usaha. */
export function DeleteBusinessCard({ businessName }: { businessName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      setError(null);
      const result = await deleteBusinessAction({ confirmName });
      if (!result.ok) {
        setError(result.error.fieldErrors?.confirmName?.[0] ?? result.error.message);
        return;
      }
      router.replace("/umkm-dihapus");
      router.refresh();
    });

  return (
    <div className="space-y-3 rounded-2xl border border-destructive/30 p-4">
      <div className="space-y-1">
        <h2 className="font-medium text-destructive">Hapus UMKM</h2>
        <p className="text-sm text-muted-foreground">
          Seluruh anggota tidak bisa masuk dan usahamu keluar dari statistik publik. Data disimpan{" "}
          {DELETION_GRACE_DAYS} hari dan bisa dipulihkan oleh admin, setelah itu dihapus permanen.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Hapus UMKM</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {businessName}?</DialogTitle>
            <DialogDescription>
              Ketik nama usaha di bawah untuk mengonfirmasi. Kamu dan semua karyawan akan langsung
              keluar dari aplikasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-name">Nama usaha</Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={businessName}
              autoComplete="off"
            />
            <FormMessage message={error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirm}
              disabled={isPending || confirmName.trim() === ""}
            >
              {isPending ? "Menghapus…" : "Ya, hapus UMKM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
