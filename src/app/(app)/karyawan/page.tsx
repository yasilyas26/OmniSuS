import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeList, InviteForm, employeesService } from "@/features/employees";
import { requireRolePage } from "@/server/guards";

export const metadata: Metadata = { title: "Karyawan" };

export default async function EmployeesPage() {
  const member = await requireRolePage("OWNER");
  const { employees, pendingInvitations } = await employeesService.list(member);

  return (
    <>
      <PageHeader
        title="Karyawan"
        description="Undang karyawan lewat tautan. Mereka menetapkan kata sandi sendiri."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Undang karyawan</CardTitle>
            <CardDescription>
              Salin tautan lalu kirim lewat WhatsApp atau cara lain. Tidak ada email otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar karyawan</CardTitle>
            <CardDescription>
              Demi anonimitas, kamu tidak dapat melihat siapa yang sudah atau belum mengisi survei.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeList employees={employees} pendingInvitations={pendingInvitations} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
