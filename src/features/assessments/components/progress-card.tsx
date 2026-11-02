import { Progress } from "@/components/ui/progress";

type Props = {
  ownerSubmitted: boolean;
  employeeSubmittedCount: number;
  activeEmployeeCount: number;
  minEmployeeResponses: number;
};

const PERCENT = 100;

export function ProgressCard({
  ownerSubmitted,
  employeeSubmittedCount,
  activeEmployeeCount,
  minEmployeeResponses,
}: Props) {
  const employeePercent = activeEmployeeCount
    ? Math.min(PERCENT, Math.round((employeeSubmittedCount / activeEmployeeCount) * PERCENT))
    : 0;

  return (
    <dl className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <dt>Kuesioner pemilik</dt>
        <dd className="font-medium">
          {ownerSubmitted ? "Sudah dikirim final" : "Belum dikirim final"}
        </dd>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <dt>Kuesioner karyawan</dt>
          <dd className="font-medium">
            {employeeSubmittedCount} dari {activeEmployeeCount} karyawan aktif
          </dd>
        </div>
        <Progress value={employeePercent} aria-label="Progres pengisian karyawan" />
        {employeeSubmittedCount < minEmployeeResponses ? (
          <p className="text-xs text-muted-foreground">
            Minimal {minEmployeeResponses} karyawan agar data karyawan ditampilkan secara anonim.
          </p>
        ) : null}
      </div>
    </dl>
  );
}
