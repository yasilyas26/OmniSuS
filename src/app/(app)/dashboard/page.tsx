import { CalendarClock, CheckCircle2, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Panel, StatCard } from "@/components/layout/panel";
import { Button } from "@/components/ui/button";
import { ProgressCard, assessmentsService } from "@/features/assessments";
import { businessService } from "@/features/business";
import { surveyService } from "@/features/survey";
import { getSession, requireMembership } from "@/server/guards";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const member = await requireMembership();
  const [session, business, open] = await Promise.all([
    getSession(),
    businessService.getProfile(member),
    assessmentsService.getOpen(member),
  ]);
  const isOwner = member.role === "OWNER";
  const firstName = session?.user.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight">Halo, {firstName} 👋</h1>
        <p className="text-muted-foreground">
          {isOwner
            ? `Ringkasan kondisi internal ${business.name}.`
            : `Kamu anggota tim ${business.name}.`}
        </p>
      </header>
      {isOwner ? (
        <OwnerPanel open={open} member={member} />
      ) : (
        <EmployeePanel open={open} member={member} />
      )}
    </div>
  );
}

type PanelProps = {
  open: Awaited<ReturnType<typeof assessmentsService.getOpen>>;
  member: Awaited<ReturnType<typeof requireMembership>>;
};

const MINI_BARS = 6;

/** Batang mini: sebanyak `done` dari `total` terisi penuh, sisanya redup. */
function progressBars(done: number, total: number) {
  const filled = total ? Math.round((Math.min(done, total) / total) * MINI_BARS) : 0;
  return Array.from({ length: MINI_BARS }, (_, index) =>
    index < filled ? 1 : 0.35 + index * 0.05,
  );
}

async function OwnerPanel({ open, member }: PanelProps) {
  if (!open) {
    return (
      <Panel title="Mulai penilaian" icon={<CalendarClock className="size-4" />}>
        <div className="space-y-4">
          <p className="max-w-prose text-muted-foreground">
            Undang karyawan, lalu buka periode penilaian untuk melihat kondisi internal usahamu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/karyawan">Undang karyawan</Link>
            </Button>
            <Button asChild>
              <Link href="/penilaian">Buka periode</Link>
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  const progress = await assessmentsService.getProgress(member, open.id);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Periode berjalan"
          value={open.label}
          note="Sedang dibuka"
          icon={<CalendarClock className="size-4" />}
        />
        <StatCard
          title="Karyawan sudah mengisi"
          value={`${progress.employeeSubmittedCount}/${progress.activeEmployeeCount}`}
          note={`Minimal ${progress.minEmployeeResponses} agar data tampil`}
          icon={<Users className="size-4" />}
          bars={progressBars(progress.employeeSubmittedCount, progress.activeEmployeeCount)}
        />
        <StatCard
          title="Kuesioner pemilik"
          value={progress.ownerSubmitted ? "Terkirim" : "Belum"}
          note={progress.ownerSubmitted ? "Sudah dikirim final" : "Belum dikirim final"}
          icon={<CheckCircle2 className="size-4" />}
        />
      </div>
      <Panel title={`Progres ${open.label}`}>
        <div className="space-y-5">
          <ProgressCard {...progress} />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/penilaian/${open.id}/isi`}>
                {progress.ownerSubmitted ? "Lihat kuesioner" : "Isi kuesioner"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/penilaian">Kelola periode</Link>
            </Button>
          </div>
        </div>
      </Panel>
    </>
  );
}

async function EmployeePanel({ open, member }: PanelProps) {
  if (!open) {
    return (
      <Panel title="Belum ada penilaian" icon={<CalendarClock className="size-4" />}>
        <p className="max-w-prose text-muted-foreground">
          Pemilik belum membuka periode penilaian. Kamu bisa mengisi survei begitu periode dibuka.
        </p>
      </Panel>
    );
  }

  const status = await surveyService.getMyStatus(member, open.id);
  return (
    <Panel title={`Survei ${open.label}`} icon={<CheckCircle2 className="size-4" />}>
      <div className="space-y-4">
        <p className="max-w-prose text-muted-foreground">
          {status === "SUBMITTED"
            ? "Terima kasih, jawabanmu sudah terkirim."
            : "Jawabanmu anonim; pemilik hanya melihat rata-rata."}
        </p>
        {status === "SUBMITTED" ? null : (
          <Button asChild>
            <Link href={`/penilaian/${open.id}/isi`}>
              {status === "DRAFT" ? "Lanjutkan mengisi" : "Mulai mengisi"}
            </Link>
          </Button>
        )}
      </div>
    </Panel>
  );
}
